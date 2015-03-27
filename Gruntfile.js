module.exports = function (grunt) {

    var srcFiles = ['src/**/*.js'];
    var allFiles = srcFiles.concat(['Gruntfile.js', 'test/**/*.js']);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: srcFiles,
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'dist/<%= pkg.name %>.min.js' : ['<%= concat.dist.dest %>']
                }
            }
        },
        jshint: {
            files: allFiles
        },
        jscs: {
            src: allFiles
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('default', ['jshint', 'jscs', 'concat', 'uglify']);
};
