/*
*
*@file
*	html5editor.js	
*
*
* WYSIWYG editor for html5
*
* @author
*	Will Pickard
*	http://willpickard.com
*
*/
function styletag(src){
	return "<link media='all' type='text/css' rel='stylesheet' href='"+src+"'>";
}

//script tag of this file ... html5editor.js
SCRIPT = $('script')[$('script').length - 1];

//path of this html5editor.js
SRC = $(SCRIPT).attr('src');

//split path so we can get the filename
var split = SRC.split('/');

//the name of this file
FILENAME = split[split.length - 1];

//the path to the folder containing html5editor.js
PATH_TO_FOLDER = SRC.replace('/' + FILENAME, '');

//path to css
CSS = PATH_TO_FOLDER + '/css';

//path to icons
ICONS = PATH_TO_FOLDER + '/icons';

//add links to header
$('head').append(styletag(CSS + '/html5editor.css'));
$('head').append(styletag(ICONS + '/css/font-awesome.css'));

//testing only - print globals
function globals(){
	console.log('SCRIPT: \t' , SCRIPT);
	console.log('SRC : \t' + SRC );
	console.log('FILENAME : \t' + FILENAME );
	console.log('PATH_TO_FOLDER : \t' + PATH_TO_FOLDER );
	console.log('CSS : \t' + CSS );
	console.log('ICONS : \t' + ICONS );
}


//Define keycodes

KEYCODE_ENTER	=	13;
KEYCODE_BACK	=	8;
KEYCODE_SHIFT	=	16;
KEYCODE_CTRL	=	17;
KEYCODE_Z	=	90;
KEYCODE_I	=	73;
KEYCODE_B	=	66;
KEYCODE_S	=	83;
KEYCODE_T	=	84;
KEYCODE_L	=	76;

KEYCODE_UP	=	38;
KEYCODE_DOWN	=	40;


(function($){
	$.widget('ui.htmleditor', {
		//options for the editor
		options: {
			//width of editor
			editor_width:			'700px',
			
			//height of editor
			editor_height: 			'400px',
			
			//height of wrapper
			wrapper_height:			'500px',
			
			//width of wrapper
			wrapper_width:			'700px',
			
			//the wrapper's id
			wrapper_id:		new Date().getTime() + '_htmleditor-wrapper',
			
			//the actual editor's id
			editor_id:		new Date().getTime() + '_htmleditor-editor',
			
			//the function bars id
			function_bar_id:	new Date().getTime() + '_htmleditor-function-bar',
			
			//definition of icon classes
			icons:			{
				emphasis_bold:		'fa fa-bold',
				
				emphasis_italic:		'fa fa-italic',
				
				emphasis_underline:	'fa fa-underline',
				
				font:		'fa fa-font',
				
				list:		'fa fa-list',
				
				ordered_list:	'fa fa-list-ol',
				
				code:		'fa fa-code',
				
				justify_center:	'fa fa-align-center',
				
				justify_left:	'fa fa-align-left',
				
				justify_right:	'fa fa-align-right',
				
				table:		'fa fa-table',
				
				image:		'fa fa-image',
				
				link:		'fa fa-link',

				size_h1:	'size-display header1',
					
				size_h2:	'size-display header2',
					
				size_h3:	'size-display header3',
					
				size_h4:	'size-display header4',
					
				size_h5:	'size-display header5',
					
				size_h6:	'size-display header6',
					
				size_small:	'size-display small',
					
				size_p:		'size-display paragraph',
			},
			
			icon_groups:		['size', 'emphasis', 'justify'],
			
			
			/** Events **/
			events:		{
				//when a click event happens on the editor
				onEditorClick: 		null,
			
				//when the editor receives focus
				onEditorFocus:		null,
			
				//when you focus out of the editor
				onEditorFocusOut:	null,
			
				//when the editor is keyed down
				onEditorKeyDown:	null,
				
				//when the key goes up
				onEditorKeyUp:		null,
				
				//when enter is pressed on the editor			
				onEnter:		null,
			
				//when back is pressed on the editor
				onBack:			null,
			
				//z on editor
				onZ:			null,
				
				//i
				onI:			null,
				
				//b
				onB:			null,
				
				//s
				onS:			null,
				
				//t
				onT:			null,
				
				//l
				onL:			null,
				
				//up
				onUp:			null,
				
				//down
				onDown:			null,
				
				
			},
			
			/** Wrappers **/
			//define the wrapper tags (and classes I guess) for each tagInput
			wrappers:	{
				size_p:				'<p></p>',
				
				size_h1:			'<h1></h1>',
				
				size_h2:			'<h2></h2>',
				
				size_h3:			'<h3></h3>',
				
				size_h4:			'<h4></h4>',
				
				size_h5:			'<h5></h5>',
				
				size_h6:			'<h6></h6>',
				
				size_small:			'<small></h7>',
				
				emphasis_code:			'<code></code>',
				
				emphasis_bold:			'<strong></strong>',
				
				emphasis_italic:		'<em></em>',
				
				strike:				'<strike></strike>',
				
				table:				'<table></table>',
				
				table_row:			'<tr></tr>',
				
				table_data:			'<td></td>',
				
				div:				'<div></div>',
				
				list:				'<ul></ul>',
				
				list_element:			'<li></li>',
				
				ordered_list:			'<ol></ol>',
			},
			
		},
		
		//create the editor
		//at this point this.element and this.options are set
		_create: function(){
			//set up current state
			//currentwrapper is what we wrap any text in
			this._setWrapper('size_p');
			
			//an array of lines
			this.lines = [];
			
			//currentline is the line we are on
			this.currentLine = 0;
			
			//ctrl is not currently pressed
			this.ctrl = false;
			
			//shift is not currently pressed
			this.shift = false;
			
			//there is nothing in the buffer
			this.buffer = "";
			
			//create the wrapper, toolbar, and input
			this.wrapper = $("<div class='editor-wrapper' id='"+this.options.wrapper_id+"'>").insertBefore(this.element);;
			this.functionBar = $("<div class='editor-function-bar' id='"+this.options.function_bar_id+"'>").appendTo(this.wrapper);
			this.editor = $("<div class='editor' id='"+this.options.editor_id+"' contenteditable=true></div>").appendTo(this.wrapper);
			
			$(this.element).hide();
			
			this.editor.addClass('editor');
		
			//testing only
			this.testbox = $("<div id='test-box'></div>").insertAfter(this.wrapper);
			
			$(this.wrapper).css({
				'height': this.options.wrapper_height,
				'width': this.options.wrapper_width,
			});
			
			$(this.editor).css({
				'height': this.options.editor_height,
				'width': this.options.editor_width,
			});
			
			//prepare the button groups
			this.icon_groups = [];
			for(group in this.options.icon_groups){
				this.icon_groups[this.options.icon_groups[group]] = [];
			}
			
			//create the icons
			//and wrap the icons with a function button
			this.icons = [];
			this.functionButtons = [];
			this.singletonButtons = [];
			
			for(icon in this.options.icons){
				//make the icon
				this.icons[icon] = this.newIcon(icon);
				
				//make the function button
				this.functionButtons[icon] =	this.newFunctionButton(icon, this.icons[icon]);
				
				//handle groups here
				if(this._isInGroup(icon)){
					this.icon_groups[this._toGroup(icon)].push(this.functionButtons[icon]);
				}
				else{
					this.singletonButtons.push(this.functionButtons[icon]);
				}
				
			}
			
			//make the btn groups
			this.functionGroups = [];
			for(group in this.icon_groups){
				/*if(group === "size"){
					this.functionGroups[group] = this.newSelect(group, this.icon_groups[group]);
				}
				
				else	*/
					this.functionGroups[group] = this.newGroup(group, this.icon_groups[group]);
			}
			
			//make the editor's title
			$(this.functionBar).append('<h1 class="editor-title">[ HTML5 Editor ]</h1>');
			
			//make all the singleton buttons
			var seperator = $('<div role="seperator" class="singletons editor-seperator"></div>');
			for(button in this.singletonButtons){
				$(seperator).append(this.singletonButtons[button]);
			}
			$(this.functionBar).append(seperator);
			
			//append the groups
			seperator = $('<div role="seperator" class="groups editor-seperator"></div>');
			for(group in this.functionGroups){
				$(seperator).append(this.functionGroups[group]);
			}
			$(this.functionBar).append(seperator);
			
			
			/**** event binding ****/
			
			//these are left null in case the user wants to update them
			this.options.events.onEditorClick = this.options.events.onEditorClick == null ? this.onEditorClick : this.options.events.onEditorClick;
			this.options.events.onEditorFocus = this.options.events.onEditorFocus == null ? this.onEditorFocus: this.options.events.onEditorFocus;
			this.options.events.onEditorFocusOut = this.options.events.onEditorFocusOut == null ? this.onEditorFocusOut: this.options.events.onEditorFocusOut;
			this.options.events.onEditorKeyDown = this.options.events.onEditorKeyDown == null ? this.onEditorKeyDown: this.options.events.onEditorKeyDown;
			this.options.events.onEditorKeyUp = this.options.events.onEditorKeyUp == null ? this.onEditorKeyUp : this.options.events.onEditorKeyUp;
			this.options.events.onEnter = this.options.events.onEnter == null ? this.onEnter: this.options.events.onEnter;
			this.options.events.onBack = this.options.events.onBack == null ? this.onBack: this.options.events.onBack;
			this.options.events.onZ = this.options.events.onZ == null ? this.onZ : this.options.events.onZ ;
			this.options.events.onI = this.options.events.onI == null ? this.onI : this.options.events.onI ;
			this.options.events.onB = this.options.events.onB == null ? this.onB  : this.options.events.onB ;
			this.options.events.onS = this.options.events.onS == null ? this.onS : this.options.events.onS ;
			this.options.events.onT = this.options.events.onT == null ? this.onT : this.options.events.onT ;
			this.options.events.onL = this.options.events.onL == null ? this.onL : this.options.events.onL ;
			this.options.events.onUp = this.options.events.onUp == null ? this.onUp : this.options.events.onUp ;
			this.options.events.onDown = this.options.events.onDown == null ? this.onDown : this.options.events.onDown ;
			
			var that = this;
			this._on(this.editor, {
				'click': 	that.options.events.onEditorClick,
				'focus':	that.options.events.onEditorFocus,
				'focusout':	that.options.events.onEditorFocusOut,
				'keydown':	that.options.events.onEditorKeyDown,
				'keyup':	that.options.events.onEditorKeyUp,
			});
			
			this._on('.function-btn', {
				'click':	that._onFunctionButtonClick,
			});
			
			
			//make the first line			
			this._newLine();
		},
		
		//check to see if the type belongs to a group... groups are delimeted by a _
		//so the group 'size' is of form size_* where * can be h1,h2,ect
		_isInGroup: function(type){
			return Boolean(this.options.icon_groups.indexOf(this._toGroup(type)) >= 0);
		},
		
		//accept a string and return a group
		//the group is just everything up to a "_"
		_toGroup: function(type){
			return type.substring(0, type.indexOf('_') > 0 ? type.indexOf('_') : type.length );
		},
		
		_ctrl:	function(bool){
			this.ctrl = bool;
		},
		
		_shift:	function(bool){
			this.shift = bool;
		},
		
		getCtrl: function(){
			return this.ctrl;	
		},
		
		//set the currentWrapper to the specified type
		//the wrapper surrdounds new lines...fuck its late
		_setWrapper: function(type){
			this.currentWrapper = this.options.wrappers[type];
		},
		//wrap the text with the current wrapper
		_wrap: function(text){
			var t = $(this.currentWrapper).append(text);
			
			return t;
		},
		
		//create a new line
		_newLine: function(){
			var line = this._wrap('');
			
			console.log(line);
			this.lines.push(line);
			
			this.currentLine = this.lines.length - 1;
			
			$(line).appendTo(this.editor);
		},
		
		//update the current line
		_updateLine: function(text){
			$(this.lines[this.currentLine]).text($(this.lines[this.currentLine]).text() + text);
		},
		
		//take a keycode and return the correct char
		_keyCodeToChar: function(keyCode){
			return this._formatChar(String.fromCharCode(keyCode));
		},
		
		//check to see if shift is held, and handle appropriately
		_formatChar: function(char){
			if(this.shift)	return char.toUpperCase();
			else		return char.toLowerCase();	
		},
		
		//accepts two params, each with a corresponding mouse highlight position
		_highlight: function(start, stop){
			console.log('highlight');
			console.log(start);
			console.log(stop);
		},
		
		//iterate through the options.icons list and find the key for name
		_iconClass : function(name){
			for(key in this.options.icons){
				console.log('checking key: '  + key + ' is ' + this.options.icons[key] + ' against ' + name);
				if(this.options.icons[key] === name){
					console.log('hit on ' + key);
				}
			}
		},
		
		_onFunctionButtonClick: function(event){
			var target, type, wrapper;
			
			target = event.currentTarget;
			
			type = $(target).attr('data-wrapper');
			
			this._setWrapper(type);
		},
		
		//create a new icon
		//param is the class name in this.options.icon.* where * is the class name
		newIcon: function(type){
			var c = this.options.icons[type];
			return $('<i class="'+c+' icon"></i>');
		},
		
		//make a function button
		newFunctionButton: function(type, icon){
			var b = $('<span data-wrapper="'+type+'" class="function-btn" role="function"></span>');
			$(icon).appendTo(b);
			return b;
		},
		
		//make a group
		newGroup: function(group, buttons){
			var g = $('<div class="btn-group ' + group + '"></div>');
			
			for(i in buttons){
				$(g).append(buttons[i]);
			}
			
			return g;
		},
		
		//make a select box
		newSelect: function(group, options){
			var s = $('<select class="editor-select ' + group + '"></select>');
			
			for(i in options){
				var option = $("<option></option>");
				var o = $(option).append(options[i]);
				$(s).append(o);
			}
			
			return s;
		},
		
		//write into a buffer during keydowns and read from it & reset during keyups
		buff: function(char){
			this.buffer += char;
		},
		
		clearBuffer: function(){
			var b = this.buffer;
			
			//clear it
			this.buffer = "";
			
			return b;
		},
		
		onEditorClick : function(event){
			if(this.lines.length <= 0){
				this._newLine();
			}
			var isDragging = false;
			
			var start = {
				x:	event.clientX,
				y:	event.clientY,
			};
			
			this._on(this.editor, {
				'mousemove' :function(){
					isDragging = true;
					
					this._off(this.editor, 'mousemove');
				},
			});
			
			this._on(this.editor, {
				'mouseup': function(event){
					if(isDragging){
						var stop = {
							x:	event.clientX,
							y:	event.clientY,
						};
						
						this._highlight(start, stop);
					}
					
					this._off(this.editor, 'mouseup');
				},	
				
			});
			
			
		},

		onEditorFocus : function(event){
			//console.log('editor focus...', event);
		},
		
		onEditorFocusOut : function(event){
			//console.log('editor focusout...', event);
		},
		
		onEditorKeyDown: function(event){
			
			var c = this._keyCodeToChar(event.keyCode);
			
			//if c is only 1 long then add it to the buffer
			//this needs to be handled better...super hacky solution
			if(c.length == 1){
				this.buff(c);
			}
			
			switch(event.which){
				case KEYCODE_CTRL:
					this._onCtrlDown(event);
					break;
				case KEYCODE_SHIFT:
					this._onShiftDown(event);
					break;
			};	
			
			$(this.lines[this.currentLine]).keydown(event);
		},
		
		onEditorKeyUp : function(event){
			event.preventDefault();
			
			var text = this.clearBuffer();
			this._updateLine(text);
			
			switch(event.which){
				case KEYCODE_ENTER:
					this._onEnter(event);
					break;
				case KEYCODE_BACK:
					this._onBack(event);
					break;	
				case KEYCODE_CTRL:
					this._onCtrlUp(event);
					break;	
				case KEYCODE_SHIFT:
					this._onShiftUp(event);
					break;
				case KEYCODE_Z:
					this._onZ(event);
					break;	
				case KEYCODE_I:
					this._onI(event);
					break;	
				case KEYCODE_B:
					this._onB(event);
					break;	
				case KEYCODE_S:
					this._onS(event);
					break;	
				case KEYCODE_T:
					this._onT(event);
					break;	
				case KEYCODE_L:
					this._onL(event);
					break;		
				case KEYCODE_UP: 
					this._onUp(event);
					break;	
					
				case KEYCODE_DOWN:
					this._onDown(event);
					break;
			};
		},
		
		_onEnter: function(event){
			this._newLine();
		},
		
		_onBack: function(event){
			console.log('back');
		},
		
		//toggle ctrl
		_onCtrlDown: function(event){
			this._ctrl(true);
		},
		_onCtrlUp: function(event){
			this._ctrl(false);
		},
		
		//toggle shift
		_onShiftDown: function(event){
			this._shift(true);
		},
		_onShiftUp: function(event){
			this._shift(false);
		},
		
		_onZ: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + Z');
			}
		},
		
		_onI: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + I');
			}
		},
		
		_onB: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + B');
			}
		},
		
		_onS: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + S');
			}
		},
		
		_onT: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + T');
			}
		},
		
		_onL: function(event){
			if(this.ctrl){
				event.preventDefault();
				console.log('CTRL + L');
			}
		},
		
		_onUp: function(event){
			console.log('up');
		},
		
		_onDown: function(event){
			console.log('down');
		},
		
		_functionButtonClick:  function(event){
			var target = event.currentTarget;
			
			this._setWrapper('code');
		},
		
	});
})(jQuery);


///testing only!
$(document).ready(function(){

	$('textarea').htmleditor();
	var h = $(window).height();
	$('body').css({'height':h+'px'});
});