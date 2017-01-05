/// <reference path="Buffer.js" />

 XMap.Chunck = function(size)
{
    this.size = size;

    this.bbox = {};

    this.bbox.p1 = vec3.create();
    this.bbox.p2 = vec3.create();
    this.bbox.p3 = vec3.create();
    this.bbox.p4 = vec3.create();

    this.bbox.p5 = vec3.create();
    this.bbox.p6 = vec3.create();
    this.bbox.p7 = vec3.create();
    this.bbox.p8 = vec3.create();

    this.buffer = {};
};

XMap.Chunck.prototype =
{
    create: function ()
    {
        var indices   = [];
        var vertices  = [];
        var texCoords = [];

        var k = 0;
        var n = 0;
        
        for (var i = 0; i < this.size + 3; ++i) //CENTERED ON (0,0,0)
        {
            for (var j = 0; j < this.size + 3; ++j)
            {
                if (i == 0 && j> 0)
                {
                    vertices[k] = -1 + 2 * (j - 1) / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * i / this.size;
                }

                else if (i > 0 && j == 0)
                {
                    vertices[k] = -1 + 2 * j  / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * (i - 1)/ this.size;
                    
                }
                else if (i == 0 && j == 0) {
                    vertices[k] = -1 + 2 * j / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * i / this.size;
                   
                }

                else if (i == (this.size + 2) && j <(this.size+2)) {
                    vertices[k] = -1 + 2 * (j - 1) / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * (i - 2) / this.size;
                    
                }

                else if (j == (this.size + 2) && i < (this.size + 2)) {
                    vertices[k] = -1 + 2 * (j - 2) / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * (i - 1) / this.size;
                   
                }

                else if (j == (this.size + 2) && i == (this.size + 2)) {
                    vertices[k] = -1 + 2 * (j - 2) / this.size;
                    vertices[k + 1] = -0.02;
                    vertices[k + 2] = -1 + 2 * (i - 2) / this.size;
                    
                }

                else
                {
                    vertices[k] = -1 + 2 * (j - 1) / this.size;
                    vertices[k + 1] = 0.0;
                    vertices[k + 2] = -1 + 2 * (i - 1) / this.size;
                }
                
                vertices[k + 3] = j / (this.size);
                vertices[k + 4] = i / (this.size);

               
                k += 5;
            }
        }

        for (var i = 0; i < this.size+2; ++i)
        {
            for (var j = 0; j < this.size+2; ++j)
            {
                indices[n] = i + j * (this.size+3);
                indices[n + 1] = i + 1 + j * (this.size+3);
                indices[n + 2] = i + (j + 1) * (this.size+3);
                indices[n + 3] = i + (j + 1) * (this.size+3);
                indices[n + 4] = i + 1 + j * (this.size+3);
                indices[n + 5] = i + 1 + (j + 1) * (this.size+3);
                n += 6;
            }
        }

        this.buffer = new XMap.Buffer("vShader", "fShader", 'vbboxShader', 'fbboxShader');
        this.buffer.init(true);
        this.buffer.create(vertices, indices);

        //BBOX
        this.buffer.initBBox();

        var bboxIndices = [
            1, 3, 2, 0, // BOTTOM
            4, 6, 7, 5,  // TOP
            8, 11, 10, 9 // BACK
        ];  

        this.bbox.p1 = vec3.create([-1.0, -1.0, -1.0]);
        this.bbox.p2 = vec3.create([-1.0, -1.0,  1.0]);
        this.bbox.p3 = vec3.create([1.0,  -1.0, -1.0]);
        this.bbox.p4 = vec3.create([1.0,  -1.0,  1.0]);

        this.bbox.p5 = vec3.create([-1.0, 1.0, -1.0]);
        this.bbox.p6 = vec3.create([-1.0, 1.0,  1.0]);
        this.bbox.p7 = vec3.create([1.0,  1.0, -1.0]);
        this.bbox.p8 = vec3.create([1.0,  1.0,  1.0]);

        var bboxVertices = [
            //Bottom
            vertices[0], -1.0, vertices[2],                                     
            vertices[vertices.length - 3], -1.0, vertices[2],                  
            vertices[0], -1.0, vertices[vertices.length - 1],                  
            vertices[vertices.length - 3], -1.0, vertices[vertices.length - 1],

            //top
            vertices[0], 1.0, vertices[2],
            vertices[vertices.length - 3], 1.0, vertices[2],
            vertices[0], 1.0, vertices[vertices.length - 1],
            vertices[vertices.length - 3], 1.0, vertices[vertices.length - 1],

            //BACK
            vertices[0], -1.0, vertices[vertices.length - 1],
            vertices[0], 1.0, vertices[vertices.length - 1],
            vertices[vertices.length - 3], 1.0, vertices[vertices.length - 1],
            vertices[vertices.length - 3], -1.0, vertices[vertices.length - 1]
        ];

        this.buffer.createBBox(bboxVertices, bboxIndices);
    },

    render: function (projMatrix, viewMatrix, texture, wireframe)
    {
        this.buffer.render(projMatrix, viewMatrix, texture, wireframe);
    },

    setMatrixUniforms: function (projMatrix, viewMatrix,  camera)
    {
        this.buffer.setMatrixUniforms(projMatrix, viewMatrix,  camera);
    },

    setBBoxMatrixUniforms : function(projMatrix, viewMatrix) {
        this.buffer.setBBoxMatrixUniform(projMatrix, viewMatrix);
    },

    prerender: function (node) {
        this.buffer.prerender(node);
    },

    prerenderBbox: function (node) {
        this.buffer.prerenderBbox(node);
    },

    setProgram: function () {
        this.buffer.setProgram();
    },

    setBBoxProgram : function() {
        this.buffer.setBBboxProgram();
    },

    disableProgram: function () {
        this.buffer.disableProgram();
    },

    draw: function (wireframe) {
        this.buffer.drawInstanced(wireframe);
    },

    drawBBox : function() {
        this.buffer.drawBBox();
    }
}