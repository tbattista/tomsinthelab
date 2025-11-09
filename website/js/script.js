(function ($) {

  "use strict";

  // ------------------------------------------------------------------------------ //
  // Overlay Menu Navigation
  // ------------------------------------------------------------------------------ //
  var overlayMenu = function () {

    if (!$('.nav-overlay').length) {
      return false;
    }

    var body = undefined;
    var menu = undefined;
    var menuItems = undefined;
    var init = function init() {
      body = document.querySelector('body');
      menu = document.querySelector('.menu-btn');
      menuItems = document.querySelectorAll('.nav__list-item');
      applyListeners();
    };
    var applyListeners = function applyListeners() {
      menu.addEventListener('click', function () {
        return toggleClass(body, 'nav-active');
      });
    };
    var toggleClass = function toggleClass(element, stringClass) {
      if (element.classList.contains(stringClass)) element.classList.remove(stringClass); else element.classList.add(stringClass);
    };
    init();
  }


  // Portfolio Slider
  var swiper = new Swiper(".portfolio-Swiper", {
    slidesPerView: 4,
    spaceBetween: 30,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      300: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      1200: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
  });

  // Animate Texts
  var initTextFx = function () {
    $('.txt-fx').each(function () {
      var $this = $(this);
      var newstr = '';
      var count = 0;
      var delay = 100;
      var stagger = 10;
      var words = this.textContent.split(/\s/);
      var arrWords = new Array();
      
      // Skip text animation for all headings - keep them always visible
      if ($this.hasClass('banner-title') || 
          $this.is('h1') || $this.is('h2') || $this.is('h3') || 
          $this.is('h4') || $this.is('h5') || $this.is('h6') ||
          $this.hasClass('display-1') || $this.hasClass('display-2') || 
          $this.hasClass('display-3') || $this.hasClass('display-4')) {
        // Don't apply text animation to headings
        return;
      }
      
      $.each( words, function( key, value ) {
        newstr = '<span class="word">';

        for ( var i = 0, l = value.length; i < l; i++ ) {
          newstr += "<span class='letter' style='transition-delay:"+ ( delay + stagger * count ) +"ms;'>"+ value[ i ] +"</span>";
          count++;
        }
        newstr += '</span>';

        arrWords.push(newstr);
        count++;
      });

      this.innerHTML = arrWords.join("<span class='letter' style='transition-delay:"+ delay +"ms;'>&nbsp;</span>");
      
      // Add fallback timeout for all text animations
      setTimeout(function() {
        if (!$this.hasClass('aos-animate')) {
          $this.find('.letter').css({
            'transform': 'translate3d(0, 0, 0)',
            'opacity': '1'
          });
        }
      }, 3000); // 3 second fallback
    });
  }

  // init Isotope
  var initIsotope = function() {
    
    $('.grid').each(function(){

      // $('.grid').imagesLoaded( function() {
        // images have loaded
        var $buttonGroup = $( '.button-group' );
        var $checked = $buttonGroup.find('.is-checked');
        var filterValue = $checked.attr('data-filter');
  
        var $grid = $('.grid').isotope({
          itemSelector: '.portfolio-item',
          // layoutMode: 'fitRows',
          filter: filterValue
        });
    
        // bind filter button click
        $('.button-group').on( 'click', 'a', function(e) {
          e.preventDefault();
          filterValue = $( this ).attr('data-filter');
          $grid.isotope({ filter: filterValue });
        });
    
        // change is-checked class on buttons
        $('.button-group').each( function( i, buttonGroup ) {
          $buttonGroup.on( 'click', 'a', function() {
            $buttonGroup.find('.is-checked').removeClass('is-checked');
            $( this ).addClass('is-checked');
          });
        });
      // });

    });
  }

  // init Chocolat light box
  var initChocolat = function() {
    Chocolat(document.querySelectorAll('.image-link'), {
      imageSize: 'contain',
      loop: true,
    })
  }

  $(document).ready(function () {

    // Initialize everything after DOM is ready
    // Menu is loaded by menu.js
    overlayMenu();
    initTextFx();
    initChocolat();

    // mobile menu
    $('.menu-btn').click(function(e){
      e.preventDefault();
      $('body').toggleClass('nav-active');
    });

    // Contact form submission
    $('#form').on('submit', function(e) {
      e.preventDefault();
      
      var name = $('input[name="name"]').val();
      var email = $('input[name="address"]').val();
      var message = $('textarea[name="message"]').val();
      
      // Basic validation
      if (!name || !email || !message) {
        alert('Please fill in all fields.');
        return;
      }
      
      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }
      
      // Create mailto link
      var subject = encodeURIComponent('Contact Form Submission from ' + name);
      var body = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Message: ' + message
      );
      
      var mailtoLink = 'mailto:tbattista@gmail.com?subject=' + subject + '&body=' + body;
      
      // Open default email client
      window.location.href = mailtoLink;
      
      // Show success message and reset form
      alert('Thank you for your message! Your default email client should now open with the message prepared.');
      this.reset();
    });

    AOS.init({
      duration: 1200,
      // once: true,
    })

  });


  // window load
  $(window).load(function () {
    $(".preloader").fadeOut("slow");
    initIsotope();
  })


})(jQuery);
