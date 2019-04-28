import './scss/main.scss';
import $ from 'jquery';
import Handlebars from "handlebars";

export default class GlobalNav {
    constructor() {
        this.el = $('.globalNav');
        this.largeMenuItemContainer = $('.navPrimaryItems');
        this.largeMenuItemTemplate = $('#large-menu-item-template');
        this.mobileMenuItemTemplate = $('#mobile-menu-item-template');
        this.mobileMenuContainer = $('.mobileProductsList');
        this.dropdownContentTemplate = $('#dropdown-content-template');
        this.arrow = this.el.find('.dropdownArrow') || undefined;
        this.dropdownBg = this.el.find('.dropdownBackground') || undefined;
        this.dropdownContainer = this.el.find('.dropdownContainer') || undefined;
        this.dropdownRoot = this.el.find('.dropdownRoot');
        this.headerDataOptions = {
            url: this.el.data('url'),
            method: this.el.data('method'),
            dataType: 'json',

        }
        this.svgOptions = {
        	url: '../src/data/svg.json',
        	method: 'GET',
        	dataType: 'json'
        }
        this.isOpen = false;
        this.init();
    }
    init() {
        this.registerHelpers();
		this.createAPIRequest(this.svgOptions).then((svgResult) => {
        	this.svgJson = svgResult;
        }, (error) => {
			this.svgJson = undefined;
        });
		setTimeout(() => { 
			this.createAPIRequest(this.headerDataOptions).then((result) => {
				if(this.svgJson) {
					for(let key in result){
						result[key].map((item, i) => item['svg'] = `${this.svgJson[item.title]}`);
					}
				}
	            this.renderTemplate(this.largeMenuItemTemplate, this.largeMenuItemContainer, result);
	            this.renderTemplate(this.dropdownContentTemplate, this.dropdownContainer, result);
	            this.renderTemplate(this.mobileMenuItemTemplate, this.mobileMenuContainer, result);
	            this.attachEvents();
	        },
	        (error) => {
	            this.$body.removeClass('loading');
	            this._handleError(error);
	        });
		}, 200);       
    }
    registerHelpers() {
        Handlebars.registerHelper('toLowerCase', function(data) {
            return data.toLowerCase();
        });
    }
    createAPIRequest(options) {      
        return $.ajax(options);
    }
    attachEvents() {
        this.el.find('.hasDropdown').on('mouseover', this.openDropdown.bind(this));
        this.el.on('mouseleave', '.hasDropdown.active, .dropdownSection.active .dropdownContent', this.closeDropdown.bind(this));
        this.el.find('.item-mobileMenu').on('click', () => {$('.navSection.mobile').addClass('globalPopupActive')});
        this.el.find('.popupCloseButton').on('click', () => {$('.navSection.mobile').removeClass('globalPopupActive')});
    }	
    closeDropdown(event) {
    	if(this.isOpen && this.el.find('.hasDropdown.active:hover, .dropdownSection.active:hover').length == 0) {
    		const target = this.el.find('.hasDropdown.active')[0];
	        const $target = $(target);
	        this.el.removeClass('dropdownActive');
	        this.isOpen = false
	        this.updatePosition(target);
    	}
    }
    openDropdown(event) {
        const target = event.currentTarget;
        const $target = $(target);
        this.isOpen = true;
        this.el.addClass('dropdownActive');
        this.updatePosition(target);
    }
    updatePosition(el) {
        const horizontalSpace = 16; 
        let targetId = el.getAttribute('data-dropdown');
        let dropdownSection = this.el.find(`.dropdownSection[data-dropdown="${targetId}"]`);
        let dropdownContent = this.el.find(`.dropdownSection[data-dropdown="${targetId}"] .dropdownContent`);
        if (!this.isOpen) {
        	this.el.find(`[data-dropdown]`).removeClass('active');
            this.dropdownRoot[0].style.opacity = 0;
            this.dropdownRoot[0].style.transform = 'rotateX(-15deg)';
            this.dropdownBg.css({
                position: 'absolute'
            });
            this.arrow[0].style.display = 'none';
            this.dropdownRoot.css({
                opacity: 0,
                transform: 'rotateX(-15deg)',
                position: 'absolute'
            });
            return;
        }
        this.dropdownBg.css({
            width: `${dropdownContent.outerWidth()}`,
            height: `${dropdownContent.outerHeight()}`
        });
        this.dropdownContainer.find('.dropdownSection').removeClass('active');

        let contWidth = this.dropdownBg.width();

        let position = el.getBoundingClientRect();
        let elementWidth = el.offsetWidth;
        this.dropdownBg.css({
            transform: `translateX(${position.x - contWidth / 2 + elementWidth / 2}px) scale(1)`,
            position: 'relative'
        });
        this.arrow[0].style.display = 'inline-block';
        this.arrow[0].style.transform = `translateX(${position.x + elementWidth / 2}px) rotate(45deg)`;
        this.dropdownRoot.css({
            opacity: 1,
            transform: 'rotateX(0)',
            position: 'relative'
        });
        this.dropdownContainer.css('transform', `translateX(${position.x - contWidth / 2 + elementWidth / 2}px) scale(1)`);
        this.el.find('.dropdownSection').css('opacity', 0);
        dropdownSection.css({
            opacity: 1,
            background: 'transparent'
        });
        this.el.find(`[data-dropdown="${targetId}"]`).addClass('active');    
    }
    renderTemplate(template, container, data) {
    	const resultTemplate = Handlebars.compile(template.html());
        container.html(resultTemplate(data)).fadeIn('slow');;
    }
}

$(document).ready(function() {
    new GlobalNav();
});