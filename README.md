Lite-TE is a simple light weight template engine.

# Usage

1. install lite-te using npm `npm install lite-te --save`
2. import lite-te as `var liteTE = require('lite-te');`
3. pass your html to compile function of liteTE as `var template = liteTE.compile(your-html-string);`
4. the `template` variable now consists of `bindContext` function which binds your javascript object to the        html. `var html = temlate.bindContext(your-object);`

# Example

## For node environment

    var liteTE = require('lite-te');
    var tempalte = liteTE.compile('<p>{{ this.profile.name }}</p><p>{{ this.profile.age }}</p>');
    var html = template.bindContext({ 
        profile: {
            name: 'Hello World',
            age: '100 years'
        }
    });
    document.querySelector('body').innerHTML = html;

## For plain javascript

1. download the index.js file from `https://github.com/KiranMantha/lite-te` to the local source code folder.
2. refer the downloaded file in the html page.
3. access the `liteTE` object from `window` object as `window.liteTE`.

Example

    var tempalte = liteTE.compile('<p>{{ this.profile.name }}</p><p>{{ this.profile.age }}</p>');
    var html = template.bindContext({ 
        profile: {
            name: 'Hello World',
            age: '100 years'
        }
    });
    document.querySelector('body').innerHTML = html;

Note: In the above example we're not using `require` as we're not using node environment.
