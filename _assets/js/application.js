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
    $(this).remove();
  };
  img.onerror = function(){
    $(this).remove();
  }
}

Carly.home = function(){

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

  $('#photos .more').click(revealImages);

}