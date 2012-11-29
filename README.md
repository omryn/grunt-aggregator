# GruntAggregator
Aggregates file groups (aka aggregations): Minifies files with include/exclude wildcards,
creates an index and debug index of the minified files, and runs lint and copy tasks.
GruntAggregator also include a modify task, which allows manipulation of file name and content
## Tasks
### aggregate task
Aggregate is a multitask, which creates multiple minified files, copies the original files (for debugging)
  and creates an {index}.json file with aggregation mapping.
  In addition, a {index}.debug.json if created, mapping the full, unminified version of the content.
This is useful if you're running your application in debug mode.
#### Usage:
```javascript
// Project configuration.
grunt.initConfig({
    aggregate:{
                main:{
                    src:         'deployment/main.json',
                    manifest:    'target/main/index.json',
                    manifestCopy:'src/main/index.json', // Optional
                    min: true, // Optional, default is true
                    lint: true, // Optional, default is true
                    copy: true // Optional, default is true
                }
            },
});
```
deployment/main.json
```javascript
// Project configuration.
[
    {
        "id":                 "bootstrap", // Minified file name will be {id}.min.js
        "sourceDir":          "src/javascript", // Root source folder
        "package":            "bootstrap", // A subfolder within the source. will be copied to same relative path within the target
        "targetDir":          "javascript", // Target root
        "excludeFromManifest":false, // Optional used to create a minified file and exclude it from manifest index
        "tags": [   // Will be copied to index.json file
            'some tag'
        ],
        "atPhase": "MyPhase", // Optional, will be copied to index.json file
        "include":            [
            "**/*.js" // will aggregate all the js files from src/javascript/bootstrap to target/main/bootstrap
        ],
        "exclude":            ["**/~*"]
    }
]
```

