var Carly = {};

Carly.checkMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
  return check; 
}

Carly.preloadImg = function($el){
  var preload = new Image();
  if ($el.parent().attr('id') === 'headshot') {
    if (!Carly.checkMobile() && window.devicePixelRatio > 1.2)
      preload.src = '/images/headshot@2x.jpg';
    else
      preload.src = '/images/headshot.jpg';
  } else {
    preload.src = '/images/photos/' + $el.data().img;
  }
  $el.append(preload);
  $el.parent().addClass('loading');

  preload.onload = function(){
    // Is image size bigger than 0x0?
    if ('naturalHeight' in this) {
        if (this.naturalHeight + this.naturalWidth === 0) {
            this.onerror();
            return;
        }
    } else if (this.width + this.height == 0) {
        this.onerror();
        return;
    }

    // All good
    var $parent = $(this).parent();
    $parent.css('background-image','url(' + this.src + ')');
    $parent.parent().removeClass('loading')
    if ($parent.data('bg-position')) {
      $parent.css('background-position',$parent.data('bg-position'));
    }
    if (this.naturalHeight > this.naturalWidth) $(this).parent().addClass('portrait');

    $(this).remove();
  };
  preload.onerror = function(){
    $(this).remove();
  }
}

Carly.home = function(){
  
  var $lightbox = $('#lightbox');
  var lastScroll = 0;
  var isAnimating = false;
  var currIndex = null;

  var setupImages = function(){

    Carly.preloadImg($('#headshot .bg'));

    var yaml = (function() {
      var yaml = null;
      $.ajax({
        'async': false,
        'global': false,
        'url': "/images/photos.yml",
        'success': function (data) {
            yaml = data;
        }
      });
      return yaml;
    })();

    var imgData = JSYAML.eval(yaml);

    for (var i in imgData) {
      var img = imgData[i];
      addIndexPhoto(img);
      addLightboxPhoto(img);
    }

    $('#photos li .bg').each(function(i,el){
      if (i < 12) {
        Carly.preloadImg($(el));
      }
    })
  }

  var addIndexPhoto = function(img){
    var $ul = $('#photos ul');
    var $li = $('<li></li>');
    var template = '<div class="bg" data-img="' + img.filename + '"></div>';

    if (img.title) {
      template += '<div class="caption"><p>' + img.title + '</p></div>';
    } else if (img.play) {
      template += '<div class="caption"><p>' + img.play + '</p></div>';
    }
    
    $li.append(template);
    
    if (img.bgPosition) {
      var $bg = $li.children('.bg');
      $bg.data('bg-position', img.bgPosition);
    }

    $ul.append($li);
  }

  var addLightboxPhoto = function(img){

    var appendToCaption = function(key, elType, prefix){
      if (img[key]) {
        var el = document.createElement(elType);
        el.innerHTML = prefix ? prefix + ' ' + img[key] : img[key];
        el.className = key;
        $caption[0].appendChild(el);
      }
    }

    var $slides = $('#lightbox #slides');

    var $slide = $('<div class="slide"></div>');
    var template = '<div class="bg" data-img="' + img.filename + '"></div>' +
                   '<div class="caption"></div>';
    $slide.append(template);

    if (img.bgPosition) {
      var $bg = $slide.children('.bg');
      $bg.data('bg-position', img.bgPosition);
    }

    var $caption = $slide.children('.caption');
    if (img.title) {
      appendToCaption('title', 'h3');
    } else {
      appendToCaption('play', 'h3');
      appendToCaption('author', 'p', 'by');
      appendToCaption('director', 'p', 'directed by');
      appendToCaption('theater', 'p');
      appendToCaption('photographer', 'p', 'photograph by');
    }
    if ($caption.children().length === 0) {
      $caption.remove();
    }
    $slides.append($slide);
  }

  var setupLightbox = function(){


    var photoClicked = function(e){
      goToSlide($(this).index(), null, false);
      showLightbox();
    }

    var showLightbox = function(){
      lastScroll = $(document).scrollTop();
      $('html').addClass('noscroll');
      $lightbox.removeClass('hidden');
      setTimeout(function(){
        $lightbox.removeClass('visually-hidden');
      })
    }

    var hideLightbox = function(){
      $lightbox.addClass('visually-hidden');
      $('html').removeClass('noscroll');
      $(document).scrollTop(lastScroll);
      setTimeout(function(){
        $lightbox.addClass('hidden');
        $lightbox.children('#slides').children().removeClass('active')
      }, 350);
    }

    var goToSlide = function(slideNumber, direction, animated){
      if (isAnimating || slideNumber == currIndex) return;
      if (slideNumber.data) slideNumber = slideNumber.data.slideNumber;
      if (arguments.length == 2) animated = true;

      $slides = $('#lightbox #slides').children('div');

      var $currSlide = $($slides[currIndex]);
      var $nextSlide = $($slides[slideNumber]);

      Carly.preloadImg($nextSlide.children('.bg'));

      if (!animated) {
        $currSlide.removeClass('active');
        $nextSlide.addClass('active');
      } else {
        isAnimating = true;

        if (!direction){
          if (slideNumber > currIndex)
            direction = 1;
          else
            direction = -1
        }
        if (direction > 0) {
          $currSlide.addClass('left');
          $nextSlide.addClass('right');
          $nextSlide.addClass('active');
        }
        if (direction < 0) {
          $currSlide.addClass('right');
          $nextSlide.addClass('left');
          $nextSlide.addClass('active');
        }

        setTimeout(function(){
          $currSlide.removeClass('active');
          $currSlide.removeClass('left right no-animate');
          $nextSlide.removeClass('left right no-animate');
          isAnimating = false;
        }, animated ? 500 : 100);
      }

      currIndex = slideNumber;
    }

    var nextSlide = function(){
      var index = currIndex + 1;
      if (index >= $slides.length)
        index = 0;
      goToSlide(index, 1);
    }

    var prevSlide = function(){
      var index = currIndex - 1;
      if (index < 0)
        index = $slides.length - 1;
      goToSlide(index, -1);
    }

    $('#lightbox #close').click(hideLightbox);
    $('#lightbox #prev').click(prevSlide);
    $('#lightbox #next').click(nextSlide);
    $('#photos li').click(photoClicked);
  }

  var revealImages = function(){
    $('#photos li .bg').each(function(i,el){
      if ( i < 12 ) return;
      Carly.preloadImg($(el));
    })
    $('#photos').removeClass('collapsed');
  }

  setupImages();
  setupLightbox();

  $('#photos .more').click(revealImages);
  $('#info .bio').click(function(e){
    e.preventDefault();
    $('#top').addClass('show-bio');
  });
  $('#bio .back').click(function(e){
    e.preventDefault();
    $('#top').removeClass('show-bio');
  });

  var $photos = $('#photos'),
      timer;

  window.addEventListener('scroll', function() {
    clearTimeout(timer);
    if(!$photos.hasClass('disable-hover')) {
      $photos.addClass('disable-hover');
    }
    
    timer = setTimeout(function(){
      $photos.removeClass('disable-hover');
    },50);
  }, false);

};

Carly.whichTransitionEvent = function(){
    var t;
    var el = document.createElement('fakeelement');
    var transitions = {
      'transition':'transitionend',
      'OTransition':'oTransitionEnd',
      'MozTransition':'transitionend',
      'WebkitTransition':'webkitTransitionEnd'
    }

    for(t in transitions){
        if( el.style[t] !== undefined ){
            return transitions[t];
        }
    }
}
