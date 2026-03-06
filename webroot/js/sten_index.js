$(document).ready(function() {
    // Initialize Scrollspy
    $('body').scrollspy({ target: '.navbar', offset: 70 });

    // Update active link color
    $(window).on('activate.bs.scrollspy', function() {
        $('.nav-link').removeClass('active');
        $('.nav-link').filter('.active').css('color', 'red');
    });

    // Initialize modals
    $('.portfolio-link').click(function(e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $(target).modal('show');
    });

    // Close modal button
    $('.portfolio-modal .btn').click(function() {
        $(this).closest('.modal').modal('hide');
    });

    // Navbar toggler (hamburger menu) toggle
    $('.navbar-toggler').click(function() {
        $('#navbarResponsive').collapse('toggle');
    });

    // Initialize carousels
    $('#portfolioCarousel1').carousel({
        interval: false // Disable automatic cycling
    });
});
