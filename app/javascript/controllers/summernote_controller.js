import { Controller } from 'stimulus'

// summernote용 자바스크립트 (Bootstrap 4 버전용)
require('summernote/dist/summernote-bs4.js');
// summernote용 스타일시트 (Boostrap 4 버전용)
require('summernote/dist/summernote-bs4.css');
// summernote용 한국어 로케일
require('summernote/dist/lang/summernote-ko-KR.min.js');
// codemirror용 자바스크립트
require('codemirror/lib/codemirror.js');
// codemirror용 스타일시트
require('codemirror/lib/codemirror.css');
// codemirror용 language 모드를 xml로 지정
require('codemirror/mode/xml/xml.js');
// codemirror에서 사용하는 테마 스타일시트(monokai)
require('codemirror/theme/monokai.css');

export default class extends Controller {
  static targets = []

  initialize(){
    // summernote 에디터에서 이모지를 입력할 수 있도록 한번만 ajax 호출
    $.ajax({
      url: 'https://api.github.com/emojis'
    }).then(function(data) {
      window.emojis = Object.keys(data);
      window.emojiUrls = data;
    })
  }

  connect(){
    console.log("summernote connected.")
    $('[data-editor="summernote"]').summernote({
      height: 300,
      focus: true,
      lang: 'ko-KR',
      prettifyHtml: true,
      placeholder: 'type starting with : and any alphabet',
      hint: {
        match: /:([\-+\w]+)$/,
        search: function (keyword, callback) {
          callback($.grep(emojis, function (item) {
            return item.indexOf(keyword)  === 0;
          }));
        },
        template: function (item) {
          var content = emojiUrls[item];
          return '<img src="' + content + '" width="20" /> :' + item + ':';
        },
        content: function (item) {
          var url = emojiUrls[item];
          if (url) {
            return $('<img />').attr('src', url).css('width', 20)[0];
          }
          return '';
      }
      },
      codemirror: {
        theme: 'monokai',
        mode: "text/html",
        lineNumbers: true,
        lineWrapping: true,
        tabSize: 2,
        tabMode: 'indent'
      },
      callbacks: {
        onImageUpload: function(files){
          console.log('called onImageUpload.')
          <!-- multiple files uploading... -->
          for(let i = 0; i < files.length; i++){
            console.log(files[i])
            sendFile(files[i], $(this))
          }
        },
        onMediaDelete: function(target, editor, editiable){
          console.log("called onMediaDelete.")
          let upload_id = target[0].id
          if(!!upload_id){
            deleteFile(upload_id)
          }
          target.remove()
        }
      }
    })

    function sendFile(file, toSummernote){
      console.log('called sendFile().')
      let data = new FormData()
      data.append('upload[image]', file)
      $.ajax({
        data: data,
        type: 'POST',
        url: '/uploads.json',
        cache: false,
        contentType: false,
        processData: false,
        success: function(data){
          console.log("image url: ", data.url)
          console.log('successfully created.')
          let img = document.createElement("IMG")
          img.src = data.url
          img.setAttribute('id', data.upload_id)
          toSummernote.summernote("insertNode", img)
        }
      })
    }

    function deleteFile(file_id){
      $.ajax({
        type: 'DELETE',
        url: `/uploads/${file_id}`,
        cache: false,
        contentType: false,
        processData: false
      })
    }
  }
}
