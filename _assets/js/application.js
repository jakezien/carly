var Carly = {};

Carly.preloadImg = function(img){
  img.onload = function(){
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
    $(this).parent().css('background-image','url(' + this.src + ')');
    if (this.naturalHeight > this.naturalWidth) $(this).parent().addClass('portrait');

    $(this).remove();
  };
  img.onerror = function(){
    $(this).remove();
  }
}

Carly.home = function(){
  
  var $lightbox = $('#lightbox');
  var lastScroll = 0;
  var isAnimating = false;
  var currIndex = 0;

  var setupImages = function(){
    $('#photos li .bg').each(function(i,el){
      var $el = $(el);
      if ( i >= 12 ) {
        $el.css('display','none');
        return;
      }
      var preload = new Image();
      preload.src = $el.data().img;
      Carly.preloadImg(preload);
      $el.append(preload);
    })
  }

  var setupLightbox = function(){

    var setup = function(){

      $('#photos li .bg').each(function(i,el){
        var $el = $(el);
        var $div = $(document.createElement('div'));
        $('#lightbox #slides').append($div);
        if (i == 0) $div.addClass('active');
        var preload = new Image();
        preload.src = $el.data().img;
        Carly.preloadImg(preload);
        $div.append(preload);
      });
      
      $slides = $('#lightbox #slides div');
      if ($slides.length == 1) $div.addClass('active');
    }

    var photoClicked = function(e){
      goToSlide($(this).index(), null, false);
      showLightbox();
    }

    var showLightbox = function(){
      lastScroll = $(document).scrollTop();
      $('html').addClass('noscroll');
      $lightbox.removeClass('hidden');
    }

    var hideLightbox = function(){
      $('html').removeClass('noscroll');
      $lightbox.addClass('hidden');
      $(document).scrollTop(lastScroll);
    }

    var goToSlide = function(slideNumber, direction, animated){
      if (isAnimating) return;
      if (slideNumber == currIndex) return;
      if (slideNumber.data)
        slideNumber = slideNumber.data.slideNumber;

      if (arguments.length == 2) animated = true;

      var $currSlide = $($slides[currIndex]);
      var $nextSlide = $($slides[slideNumber]);

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

    setup();
    $('#lightbox #close').click(hideLightbox);
    $('#lightbox #prev').click(prevSlide);
    $('#lightbox #next').click(nextSlide);
    $('#photos li').click(photoClicked);
  }

  var revealImages = function(){
    $('#photos li .bg').each(function(i,el){
      var $el = $(el);
      if ( i < 12 ) {
        return;
      }
      $el.css('display','inline-block');
      var preload = new Image();
      preload.src = $el.data().img;
      Carly.preloadImg(preload);
      $el.append(preload);
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
