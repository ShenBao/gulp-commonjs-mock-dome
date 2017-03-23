
var base = require('../../common/js/base/base.js');
var core = require('../../common/js/core/core.js');

function B(){
    base.A();
    core.A();
    console.log('app.js')
}
B()