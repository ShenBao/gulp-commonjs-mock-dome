/**
 * 
 * @authors shenbao 
 * @date    2017-03-21 
 * 
 */

var base = require('../../common/js/base/base.js');
var core = require('../../common/js/core/core.js');
var $ = require('../../common/js/core/jquery.min.js');

function B(){
    base.A();
    core.A();
    console.log('app.js')
}
B();

$.ajax({
    type:'POST',
    url: '/api/list.json',
    data : {
        
    },
    success : function(data) {

        if(data.status != 200) {
            console.log(data);
            return;
        }

        console.log(data);
        var json = data.attachment.devDependencies;
        var str = '';
        for (var key in json){
            console.log(key);
            str += '<li><span class="color-red">'+key+'</span> : '+json[key]+'</li>';
        }
        $('ul').html(str);
        $('b').html('author: '+ data.attachment.author)

    },
    error : function(msg) {
        console.log(msg);
    }
});



