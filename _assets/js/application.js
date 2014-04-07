var Carly = {};

Carly.preloadImg = function($el){
  var preload = new Image();
  preload.src = '/images/photos/' + $el.data().img;
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
  var currIndex = 0;

  var setupImages = function(){

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
    var template = '<div class="bg" data-img="' + img.filename + '"></div>' +
                   '<div class="caption"><p>' + (img.title ? img.title : img.play) + '</p></div>';
    
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

    var $caption = $slide.children('.caption');
    appendToCaption('play', 'h3');
    appendToCaption('author', 'p', 'by');
    appendToCaption('director', 'p', 'directed by');
    appendToCaption('theater', 'p');
    appendToCaption('photographer', 'p', 'photograph by');

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
}

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
