//-----------------------------------------------------------------------------
// 
// PURPOSE
// 
// Krona is a flexible tool for exploring the relative proportions of
// hierarchical data, such as metagenomic classifications, using a
// radial, space-filling display. It is implemented using HTML5 and
// JavaScript, allowing charts to be explored locally or served over the
// Internet, requiring only a current version of any major web
// browser. Krona charts can be created using an Excel template or from
// common bioinformatic formats using the provided conversion scripts.
// 
// 
// COPYRIGHT LICENSE
// 
// Copyright (c) 2011, Battelle National Biodefense Institute (BNBI);
// all rights reserved. Authored by: Brian Ondov, Nicholas Bergman, and
// Adam Phillippy
// 
// This Software was prepared for the Department of Homeland Security
// (DHS) by the Battelle National Biodefense Institute, LLC (BNBI) as
// part of contract HSHQDC-07-C-00020 to manage and operate the National
// Biodefense Analysis and Countermeasures Center (NBACC), a Federally
// Funded Research and Development Center.
// 
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are
// met:
// 
// * Redistributions of source code must retain the above copyright
//   notice, this list of conditions and the following disclaimer.
// 
// * Redistributions in binary form must reproduce the above copyright
//   notice, this list of conditions and the following disclaimer in the
//   documentation and/or other materials provided with the distribution.
// 
// * Neither the name of the Battelle National Biodefense Institute nor
//   the names of its contributors may be used to endorse or promote
//   products derived from this software without specific prior written
//   permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// 
// 
// TRADEMARK LICENSE
// 
// KRONA(TM) is a trademark of the Department of Homeland Security, and use
// of the trademark is subject to the following conditions:
// 
// * Distribution of the unchanged, official code/software using the
//   KRONA(TM) mark is hereby permitted by the Department of Homeland
//   Security, provided that the software is distributed without charge
//   and modification.
// 
// * Distribution of altered source code/software using the KRONA(TM) mark
//   is not permitted unless written permission has been granted by the
//   Department of Homeland Security.
// 
// 
// FOR MORE INFORMATION VISIT
// 
// https://github.com/marbl/Krona/wiki/
// 
//-----------------------------------------------------------------------------



var canvas;
var context;
var svg; // for snapshot mode
var collapse = true;
var collapseCheckBox;
var collapseLast;
var showMagnitude = false;
var compress;
var compressCheckBox;
var maxAbsoluteDepthText;
var maxAbsoluteDepthButtonDecrease;
var maxAbsoluteDepthButtonIncrease;
var fontSize = 11;
var fontSizeText;
var fontSizeButtonDecrease;
var fontSizeButtonIncrease;
var fontSizeLast;
var radiusButtonDecrease;
var radiusButtonIncrease;
var shorten;
var shortenCheckBox;
var maxAbsoluteDepth;
var backButton;
var upButton;
var forwardButton;
var snapshotButton;
var snapshotMode = false;
var details;
var detailsName;
var search;
var searchResults;
var nSearchResults;
var useHueCheckBox;
var useHueDiv;
var showMagnitudeCheckBox;
var datasetDropDown;
var datasetButtonLast;
var datasetButtonPrev;
var datasetButtonNext;
var keyControl;
var showKeys = true;
var linkButton;
var linkText;
var frame;
// Node references. Note that the meanings of 'selected' and 'focused' are
// swapped in the docs.
//
var head; // the root of the entire tree
var selectedNode = 0; // the root of the current view
var focusNode = 0; // a node chosen for more info (single-click)
var highlightedNode = 0; // mouse hover node
var highlightingHidden = false;
var nodes = new Array();
var currentNodeID = 0; // to iterate while loading

var nodeHistory = new Array();
var nodeHistoryPosition = 0;

var dataEnabled = false; // true when supplemental files are present

// store non-Krona GET variables so they can be passed on to links
//
var getVariables = new Array();

// selectedNodeLast is separate from the history, since we need to check
// properties of the last node viewed when browsing through the history
//
var selectedNodeLast = 0;
var zoomOut = false;

// temporary zoom-in while holding the mouse button on a wedge
//
var quickLook = false; // true when in quick look state
var mouseDown = false;
var mouseDownTime; // to detect mouse button hold
var quickLookHoldLength = 200;

var imageWidth;
var imageHeight;
var centerX;
var centerY;
var gRadius;
var updateViewNeeded = false;

// Determines the angle that the pie chart starts at.  90 degrees makes the
// center label consistent with the children.
//
var rotationOffset = Math.PI / 2;

var buffer;
var bufferFactor = .1;

// The maps are the small pie charts showing the current slice being viewed.
//
var mapBuffer = 10;
var mapRadius = 0;
var maxMapRadius = 25;
var mapWidth = 150;
var maxLabelOverhang = Math.PI * 4.18;

// Keys are the labeled boxes for slices in the highest level that are too thin
// to label.
//
var maxKeySizeFactor = 2; // will be multiplied by font size
var keySize;
var keys;
var keyBuffer = 10;
var currentKey;
var keyMinTextLeft;
var keyMinAngle;

var minRingWidthFactor = 5; // will be multiplied by font size
var maxPossibleDepth; // the theoretical max that can be displayed
var maxDisplayDepth; // the actual depth that will be displayed
var headerHeight = 0;//document.getElementById('options').clientHeight;
var historySpacingFactor = 1.6; // will be multiplied by font size
var historyAlphaDelta = .25;

// appearance
//
var lineOpacity = 0.3;
var saturation = 0.5;
var lightnessBase = 0.6;
var lightnessMax = .8;
var thinLineWidth = .3;
var highlightLineWidth = 1.5;
var labelBoxBuffer = 6;
var labelBoxRounding = 15;
var labelWidthFudge = 1.05; // The width of unshortened labels are set slightly
							// longer than the name width so the animation
							// finishes faster.
var fontNormal;
var fontBold;
var fontFamily = 'sans-serif';
//var fontFaceBold = 'bold Arial';
var nodeRadius;
var angleFactor;
var tickLength;
var compressedRadii;

// colors
//
var highlightFill = 'rgba(255, 255, 255, .3)';
var colorUnclassified = 'rgb(220,220,220)';

// label staggering
//
var labelOffsets; // will store the current offset at each depth
//
// This will store pointers to the last node that had a label in each offset (or "track") of a
// each depth.  These will be used to shorten neighboring labels that would overlap.
// The [nLabelNodes] index will store the last node with a radial label.
// labelFirstNodes is the same, but to check for going all the way around and
// overlapping the first labels.
//
var labelLastNodes;
var labelFirstNodes;
//
var nLabelOffsets = 3; // the number of offsets to use

var mouseX = -1;
var mouseY = -1;
var mouseXRel = -1;
var mouseYRel = -1;

// tweening
//
var progress = 0; // for tweening; goes from 0 to 1.
var progressLast = 0;
var tweenFactor = 0; // progress converted by a curve for a smoother effect.
var tweenLength = 850; // in ms
var tweenCurvature = 13;
//
// tweenMax is used to scale the sigmoid function so its range is [0,1] for the
// domain [0,1]
//
var tweenMax = 1 / (1 + Math.exp(-tweenCurvature / 2));
//
var tweenStartTime;

// for framerate debug
//
var tweenFrames = 0;
var fpsDisplay = document.getElementById('frameRate');

// Arrays to translate xml attribute names into displayable attribute names
//
var attributes = new Array();
//
var magnitudeIndex; // the index of attribute arrays used for magnitude
var membersAssignedIndex;
var membersSummaryIndex;

// For defining gradients
//
var hueDisplayName;
var hueStopPositions;
var hueStopHues;
var hueStopText;

// multiple datasets
//
var currentDataset = 0;
var lastDataset = 0;
var datasets = 1;
var datasetNames;
var datasetSelectSize = 30;
var datasetAlpha = new Tween(0, 0);
var datasetWidths = new Array();
var datasetChanged;
var datasetSelectWidth = 50;

window.onload = load;

var image;
var hiddenPattern;
var loadingImage;
var logoImage;
var overrideColor = {};
let overrideHSL = null;
let colorMode = 'multicolor';
var overridePalette  = null;
var invertPalette    = false;
var updateViewNeeded = false;
const overrideColors = {};
function backingScale()
{
	if ('devicePixelRatio' in window)
	{
		if (window.devicePixelRatio > 1)
		{
			return window.devicePixelRatio;
		}
	}
	
	return 1;
}

function resize()
{
	imageWidth = window.innerWidth;
	imageHeight = window.innerHeight;
	
	if ( ! snapshotMode )
	{
		context.canvas.width = imageWidth * backingScale();
		context.canvas.height = imageHeight * backingScale();
		context.canvas.style.width = imageWidth + "px"
		context.canvas.style.height = imageHeight + "px"
		context.scale(backingScale(), backingScale());
	}
	
	if ( datasetDropDown )
	{
		var ratio = 
			(datasetDropDown.offsetTop + datasetDropDown.clientHeight) * 2 /
			imageHeight;
		
		if ( ratio > 1 )
		{
			ratio = 1;
		}
		
		ratio = Math.sqrt(ratio);
		
		datasetSelectWidth = 
			(datasetDropDown.offsetLeft + datasetDropDown.clientWidth) * ratio;
	}
	var leftMargin = datasets > 1 ? datasetSelectWidth + 30 : 0;
	var minDimension = imageWidth - mapWidth - leftMargin > imageHeight ?
		imageHeight :
		imageWidth - mapWidth - leftMargin;
	
	maxMapRadius = minDimension * .03;
	buffer = minDimension * bufferFactor;
	margin = minDimension * .015;
	centerX = (imageWidth - mapWidth - leftMargin) / 2 + leftMargin;
	centerY = imageHeight / 2;
	gRadius = minDimension / 2 - buffer;
	//context.font = '11px sans-serif';
}

function handleResize()
{
	updateViewNeeded = true;
}

function Attribute()
{
}

function Tween(start, end)
{
	this.start = start;
	this.end = end;
	this.current = this.start;
	
	this.current = function()
	{
		if ( progress == 1 || this.start == this.end )
		{
			return this.end;
		}
		else
		{
			return this.start + tweenFactor * (this.end - this.start);
		}
	};
	
	this.setTarget = function(target)
	{
		this.start = this.current();
		this.end = target;
	}
}

function Node()
{
	this.id = currentNodeID;
	currentNodeID++;
	nodes[this.id] = this;
	
	this.angleStart = new Tween(Math.PI, 0);
	this.angleEnd = new Tween(Math.PI, 0);
	this.radiusInner = new Tween(1, 1);
	this.labelRadius = new Tween(1, 1);
	this.labelWidth = new Tween(0, 0);
	this.scale = new Tween(1, 1); // TEMP
	this.radiusOuter = new Tween(1, 1);
	
	this.r = new Tween(255, 255);
	this.g = new Tween(255, 255);
	this.b = new Tween(255, 255);
	
	this.alphaLabel = new Tween(0, 1);
	this.alphaLine = new Tween(0, 1);
	this.alphaArc = new Tween(0, 0);
	this.alphaWedge = new Tween(0, 1);
	this.alphaOther = new Tween(0, 1);
	this.alphaPattern = new Tween(0, 0);
	this.children = Array();
	this.parent = 0;
	
	this.attributes = new Array(attributes.length);
	
	this.addChild = function(child)
	{
		this.children.push(child);
	};
	
	this.addLabelNode = function(depth, labelOffset)
	{
		if ( labelHeadNodes[depth][labelOffset] == 0 )
		{
			// this will become the head node for this list
			
			labelHeadNodes[depth][labelOffset] = this;
			this.labelPrev = this;
		}
		
		var head = labelHeadNodes[depth][labelOffset];
		
		this.labelNext = head;
		this.labelPrev = head.labelPrev;
		head.labelPrev.labelNext = this;
		head.labelPrev = this;
	}
	
	this.canDisplayDepth = function()
	{
		// whether this node is at a depth that can be displayed, according
		// to the max absolute depth
		
		return this.depth <= maxAbsoluteDepth;
	}
	
	this.canDisplayHistory = function()
	{
		var radiusInner;
		
		if ( compress )
		{
			radiusInner = compressedRadii[0];
		}
		else
		{
			radiusInner = nodeRadius;
		}
		
		return (
			-this.labelRadius.end * gRadius +
			historySpacingFactor * fontSize / 2 <
			radiusInner * gRadius
			);
	}
	
	this.canDisplayLabelCurrent = function()
	{
		return (
			(this.angleEnd.current() - this.angleStart.current()) *
			(this.radiusInner.current() * gRadius + gRadius) >=
			minWidth());
	}
	
	this.checkHighlight = function()
	{
		if ( this.children.length == 0 && this == focusNode )
		{
			//return false;
		}
		
		if ( this.hide )
		{
			return false;
		}
		
		if ( this.radiusInner.end == 1 )
		{
			// compressed to the outside; don't check
			
			return false;
		}
		
		var highlighted = false;
		
		var angleStartCurrent = this.angleStart.current() + rotationOffset;
		var angleEndCurrent = this.angleEnd.current() + rotationOffset;
		var radiusInner = this.radiusInner.current() * gRadius;
		
		for ( var i = 0; i < this.children.length; i++ )
		{
			highlighted = this.children[i].checkHighlight();
			
			if ( highlighted )
			{
				return true;
			}
		}
		
		if ( this.radial )
		{
			var angleText = (angleStartCurrent + angleEndCurrent) / 2;
			var radiusText = (gRadius + radiusInner) / 2;
			
			context.rotate(angleText);
			context.beginPath();
			context.moveTo(radiusText, -fontSize);
			context.lineTo(radiusText, fontSize);
			context.lineTo(radiusText + centerX, fontSize);
			context.lineTo(radiusText + centerX, -fontSize);
			context.closePath();
			context.rotate(-angleText);
			
			if ( context.isPointInPath(mouseXRel, mouseYRel) )
			{
				var label = String(this.getPercentage()) + '%' + '   ' + this.name;
				
				if ( this.searchResultChildren() )
			    {
					label += searchResultString(this.searchResultChildren());
				}
				
				if
				(
					Math.sqrt((mouseXRel) * (mouseXRel) + (mouseYRel) * (mouseYRel)) / backingScale() <
					radiusText + measureText(label)
				)
				{
					highlighted = true;
				}
			}
		}
		else
		{
		    for ( var i = 0; i < this.hiddenLabels.length; i++ )
		    {
		        var hiddenLabel = this.hiddenLabels[i];
		        
				context.rotate(hiddenLabel.angle);
				context.beginPath();
				context.moveTo(gRadius, -fontSize);
				context.lineTo(gRadius, fontSize);
				context.lineTo(gRadius + centerX, fontSize);
				context.lineTo(gRadius + centerX, -fontSize);
				context.closePath();
				context.rotate(-hiddenLabel.angle);
				
				if ( context.isPointInPath(mouseXRel, mouseYRel) )
				{
					var label = String(hiddenLabel.value) + ' more';
					
					if ( hiddenLabel.search )
				    {
						label += searchResultString(hiddenLabel.search);
					}
					
					if
					(
						Math.sqrt((mouseXRel) * (mouseXRel) + (mouseYRel) * (mouseYRel)) / backingScale() <
						gRadius + fontSize + measureText(label)
					)
					{
						highlighted = true;
						break;
					}
				}
			}
		}
		
		if ( ! highlighted && this != selectedNode && ! this.getCollapse() )
		{
			context.beginPath();
			context.arc(0, 0, radiusInner, angleStartCurrent, angleEndCurrent, false);
			context.arc(0, 0, gRadius, angleEndCurrent, angleStartCurrent, true);
			context.closePath();
			
			if ( context.isPointInPath(mouseXRel, mouseYRel) )
			{
				highlighted = true;
			}
			
			if
			(
				! highlighted &&
				(angleEndCurrent - angleStartCurrent) *
				(radiusInner + gRadius) <
				minWidth() &&
				this.getDepth() == selectedNode.getDepth() + 1
			)
			{
				if ( showKeys && this.checkHighlightKey() )
				{
					highlighted = true;
				}
			}
		}
		
		if ( highlighted )
		{
			if ( this != highlightedNode )
			{
			//	document.body.style.cursor='pointer';
			}
			
			highlightedNode = this;
		}
		
		return highlighted;
	}
	
	this.checkHighlightCenter = function()
	{
		if ( ! this.canDisplayHistory() )
		{
			return;
		}
		
		var cx = centerX;
		var cy = centerY - this.labelRadius.end * gRadius;
		//var dim = context.measureText(this.name);
		
		var width = this.nameWidth;
		
		if ( this.searchResultChildren() )
		{
			var results = searchResultString(this.searchResultChildren());
			var dim = context.measureText(results);
			width += dim.width;
		}
		
		if
		(
			mouseX > cx - width / 2 &&
			mouseX < cx + width / 2 &&
			mouseY > cy - historySpacingFactor * fontSize / 2 &&
			mouseY < cy + historySpacingFactor * fontSize / 2
		)
		{
			highlightedNode = this;
			return;
		}
		
		if ( this.getParent() )
		{
			this.getParent().checkHighlightCenter();
		}
	}
	
	this.checkHighlightKey = function()
	{
		var offset = keyOffset();
		
		var xMin = imageWidth - keySize - margin - this.keyNameWidth - keyBuffer;
		var xMax = imageWidth - margin;
		var yMin = offset;
		var yMax = offset + keySize;
		
		currentKey++;
		
		return (
			mouseX > xMin &&
			mouseX < xMax &&
			mouseY > yMin &&
			mouseY < yMax);
	}
	
	this.checkHighlightMap = function()
	{
		if ( this.parent )
		{
			this.parent.checkHighlightMap();
		}
		
		if ( this.getCollapse() || this == focusNode )
		{
			return;
		}
		
		var box = this.getMapPosition();
		
		if
		(
			mouseX > box.x - mapRadius &&
			mouseX < box.x + mapRadius &&
			mouseY > box.y - mapRadius &&
			mouseY < box.y + mapRadius
		)
		{
			highlightedNode = this;
		}
	}
	
/*	this.collapse = function()
	{
		for (var i = 0; i < this.children.length; i++ )
		{
			this.children[i] = this.children[i].collapse();
		}
		
		if
		(
			this.children.length == 1 &&
			this.children[0].magnitude == this.magnitude
		)
		{
			this.children[0].parent = this.parent;
			this.children[0].getDepth() = this.parent.getDepth() + 1;
			return this.children[0];
		}
		else
		{
			return this;
		}
	}
*/	
	this.draw = function(labelMode, selected, searchHighlighted)
	{
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
//		var hidden = false;
		
		if ( selectedNode == this )
		{
			selected = true;
		}
		
		var angleStartCurrent = this.angleStart.current() + rotationOffset;
		var angleEndCurrent = this.angleEnd.current() + rotationOffset;
		var radiusInner = this.radiusInner.current() * gRadius;
		var canDisplayLabelCurrent = this.canDisplayLabelCurrent();
		var hiddenSearchResults = false;
		
/*		if ( ! this.hide )
		{
			for ( var i = 0; i < this.children.length; i++ )
			{
				if ( this.children[i].hide && this.children[i].searchResults )
				{
					hiddenSearchResults = true;
				}
			}
		}
*/		
		var drawChildren =
			( ! this.hide || ! this.hidePrev && progress < 1 ) &&
			( ! this.hideAlone || ! this.hideAlonePrev && progress < 1 );
		
//		if ( this.alphaWedge.current() > 0 || this.alphaLabel.current() > 0 )
		{
			var lastChildAngleEnd = angleStartCurrent;
			
			if ( this.hasChildren() )//canDisplayChildren )
			{
				lastChildAngleEnd =
					this.children[this.children.length - 1].angleEnd.current()
					+ rotationOffset;
			}
			
			if ( labelMode )
			{
				var drawRadial =
				!(
					this.parent &&
					this.parent != selectedNode &&
					angleEndCurrent == this.parent.angleEnd.current() + rotationOffset
				);
				
				//if ( angleStartCurrent != angleEndCurrent )
				{
					this.drawLines(angleStartCurrent, angleEndCurrent, radiusInner, drawRadial, selected);
				}
				
				var alphaOtherCurrent = this.alphaOther.current();
				var childRadiusInner;
				
				if ( this == selectedNode || alphaOtherCurrent )
				{
					childRadiusInner =
						this.children.length ?
							this.children[this.children.length - 1].radiusInner.current() * gRadius
						: radiusInner
				}
				
				if ( this == selectedNode )
				{
					this.drawReferenceRings(childRadiusInner);
				}
				
				if
				(
					selected &&
					! searchHighlighted &&
					this != selectedNode &&
					(
						this.isSearchResult ||
						this.hideAlone && this.searchResultChildren() ||
						false
//						this.hide &&
//						this.containsSearchResult
					)
				)
				{
					context.globalAlpha = this.alphaWedge.current();
					
					drawWedge
					(
						angleStartCurrent,
						angleEndCurrent,
						radiusInner,
						gRadius,
						highlightFill,
						0,
						true
					);
					
					if
					(
						this.keyed &&
						! showKeys &&
						this.searchResults &&
						! searchHighlighted &&
						this != highlightedNode &&
						this != focusNode
					)
					{
						var angle = (angleEndCurrent + angleStartCurrent) / 2;
						this.drawLabel(angle, true, false, true, true);
					}
					
					//this.drawHighlight(false);
					searchHighlighted = true;
				}
				
				if
				(
					this == selectedNode ||
//					true
					//(canDisplayLabelCurrent) &&
					this != highlightedNode &&
					this != focusNode
				)
				{
					if ( this.radial != this.radialPrev && this.alphaLabel.end == 1 )
					{
						context.globalAlpha = tweenFactor;
					}
					else
					{
						context.globalAlpha = this.alphaLabel.current();
					}
					
					this.drawLabel
					(
						(angleStartCurrent + angleEndCurrent) / 2,
						this.hideAlone && this.searchResultChildren() ||
						(this.isSearchResult || hiddenSearchResults) && selected,
						this == selectedNode && ! this.radial,
						selected,
						this.radial
					);
					
					if ( this.radial != this.radialPrev && this.alphaLabel.start == 1 && progress < 1 )
					{
						context.globalAlpha = 1 - tweenFactor;
						
						this.drawLabel
						(
							(angleStartCurrent + angleEndCurrent) / 2,
							(this.isSearchResult || hiddenSearchResults) && selected,
							this == selectedNodeLast && ! this.radialPrev,
							selected,
							this.radialPrev
						);
					}
				}
				
				if
				(
					alphaOtherCurrent &&
					lastChildAngleEnd != null
				)
				{
					if
					(
						(angleEndCurrent - lastChildAngleEnd) *
						(childRadiusInner + gRadius) >=
						minWidth()
					)
					{
						//context.font = fontNormal;
						context.globalAlpha = this.alphaOther.current();
						
						drawTextPolar
						(
							this.getUnclassifiedText(),
							this.getUnclassifiedPercentage(),
							(lastChildAngleEnd + angleEndCurrent) / 2,
							(childRadiusInner + gRadius) / 2,
							true,
							false,
							false,
							0,
							0
						);
					}
				}
				
				if ( this == selectedNode && this.keyUnclassified && showKeys )
				{
					this.drawKey
					(
						(lastChildAngleEnd + angleEndCurrent) / 2,
						false,
						false
					);
				}
			}
			else
			{
				var alphaWedgeCurrent = this.alphaWedge.current();
				
				if ( alphaWedgeCurrent || this.alphaOther.current() )
				{
					var currentR = this.r.current();
					var currentG = this.g.current();
					var currentB = this.b.current();
						
					var baseColor = rgbText(currentR, currentG, currentB);
					var fill      = getNodeColor(this, baseColor);
					
					var radiusOuter;
					var lastChildAngle;
					var truncateWedge =
					(
						(this.hasChildren() || this == selectedNode ) &&
						! this.keyed &&
						(compress || depth < maxDisplayDepth) &&
						drawChildren
					);
					
					if ( truncateWedge )
					{
						radiusOuter = this.children.length ? this.children[0].radiusInner.current() * gRadius : radiusInner;
					}
					else
					{
						radiusOuter = gRadius;
					}
					/*
					if ( this.hasChildren() )
					{
						radiusOuter = this.children[0].getUncollapsed().radiusInner.current() * gRadius + 1;
					}
					else
					{ // TEMP
						radiusOuter = radiusInner + nodeRadius * gRadius;
						
						if ( radiusOuter > gRadius )
						{
							radiusOuter = gRadius;
						}
					}
					*/
					context.globalAlpha = alphaWedgeCurrent;
					
					if ( radiusInner != radiusOuter || truncateWedge )
					{
						const baseColor = rgbText(currentR, currentG, currentB);
						const fill = getNodeColor(this, baseColor);
						drawWedge
						(
							angleStartCurrent,
							angleEndCurrent,
							radiusInner,
							radiusOuter,
							fill,
							this.alphaPattern.current()
						);
						
						if ( truncateWedge )
						{
							// fill in the extra space if the sum of our childrens'
							// magnitudes is less than ours
							
							if ( lastChildAngleEnd < angleEndCurrent )//&& false) // TEMP
							{
								if ( radiusOuter > 1 )
								{
									// overlap slightly to hide the seam
									
	//								radiusOuter -= 1;
								}
								
								if ( alphaWedgeCurrent < 1 )
								{
									context.globalAlpha = this.alphaOther.current();
									drawWedge
									(
										lastChildAngleEnd,
										angleEndCurrent,
										radiusOuter,
										gRadius,
										colorUnclassified,
										0
									);
									context.globalAlpha = alphaWedgeCurrent;
								}
								
								drawWedge
								(
									lastChildAngleEnd,
									angleEndCurrent,
									radiusOuter,
									gRadius,//this.radiusOuter.current() * gRadius,
									//'rgba(200, 0, 0, .1)',
									fill,
									this.alphaPattern.current()
								);
							}
						}
						
						if ( radiusOuter < gRadius )
						{
							// patch up the seam
							//
							context.beginPath();
							context.arc(0, 0, radiusOuter, angleStartCurrent/*lastChildAngleEnd*/, angleEndCurrent, false);
							context.strokeStyle = fill;
							context.lineWidth = 1;
							context.stroke();
						}
					}
					
					if ( this.keyed && selected && showKeys )//&& progress == 1 )
					{
						this.drawKey
						(
							(angleStartCurrent + angleEndCurrent) / 2,
							(
								this == highlightedNode ||
								this == focusNode ||
								this.searchResults
							),
							this == highlightedNode || this == focusNode
						);
					}
				}
			}
		}
		
		this.hiddenLabels = Array();
		
		if ( drawChildren )
		{
			// draw children
			//
			for ( var i = 0; i < this.children.length; i++ )
			{
				if ( this.drawHiddenChildren(i, selected, labelMode, searchHighlighted) )
				{
					i = this.children[i].hiddenEnd;
				}
				else
				{
					this.children[i].draw(labelMode, selected, searchHighlighted);
				}
			}
		}
	};
	
	this.drawHiddenChildren = function
	(
		firstHiddenChild,
		selected,
		labelMode,
		searchHighlighted
	)
	{
		var firstChild = this.children[firstHiddenChild];
		
		if ( firstChild.hiddenEnd == null || firstChild.radiusInner.current() == 1 )
		{
			return false;
		}
		
		for ( var i = firstHiddenChild; i < firstChild.hiddenEnd; i++ )
		{
			if ( ! this.children[i].hide || ! this.children[i].hidePrev && progress < 1 )
			{
				return false;
			}
		}
		
		var angleStart = firstChild.angleStart.current() + rotationOffset;
		var lastChild = this.children[firstChild.hiddenEnd];
		var angleEnd = lastChild.angleEnd.current() + rotationOffset;
		var radiusInner = gRadius * firstChild.radiusInner.current();
		var hiddenChildren = firstChild.hiddenEnd - firstHiddenChild + 1;
		
		if ( labelMode )
		{
			var hiddenSearchResults = 0;
			
			for ( var i = firstHiddenChild; i <= firstChild.hiddenEnd; i++ )
			{
				hiddenSearchResults += this.children[i].searchResults;
				
				if ( this.children[i].magnitude == 0 )
				{
					hiddenChildren--;
				}
			}
			
			if
			(
				selected &&
				(angleEnd - angleStart) * 
				(gRadius + gRadius) >=
				minWidth() ||
				this == highlightedNode &&
				hiddenChildren ||
				hiddenSearchResults
			)
			{
				context.globalAlpha = this.alphaWedge.current();
				
				this.drawHiddenLabel
				(
					angleStart,
					angleEnd,
					hiddenChildren,
					hiddenSearchResults
				);
			}
		}
		
		var drawWedges = true;
		
		for ( var i = firstHiddenChild; i <= firstChild.hiddenEnd; i++ )
		{
			// all hidden children must be completely hidden to draw together
			
			if ( this.children[i].alphaPattern.current() != this.children[i].alphaWedge.current() )
			{
				drawWedges = false;
				break;
			}
		}
		
		if ( labelMode )
		{
			if ( drawWedges )
			{
				var drawRadial = (angleEnd < this.angleEnd.current() + rotationOffset);
				this.drawLines(angleStart, angleEnd, radiusInner, drawRadial);
			}
			
			if ( hiddenSearchResults && ! searchHighlighted )
			{
				drawWedge
				(
					angleStart,
					angleEnd,
					radiusInner,
					gRadius,//this.radiusOuter.current() * gRadius,
					highlightFill,
					0,
					true
				);
			}
		}
		else if ( drawWedges )
		{
			context.globalAlpha = this.alphaWedge.current();
			
			var fill = rgbText
			(
				firstChild.r.current(),
				firstChild.g.current(),
				firstChild.b.current()
			);
			
			drawWedge
			(
				angleStart,
				angleEnd,
				radiusInner,
				gRadius,//this.radiusOuter.current() * gRadius,
				fill,
				context.globalAlpha,
				false
			);
		}
		
		return drawWedges;
	}
	
	this.drawHiddenLabel = function(angleStart, angleEnd, value, hiddenSearchResults)
	{
		var textAngle = (angleStart + angleEnd) / 2;
		var labelRadius = gRadius + fontSize;//(radiusInner + radius) / 2;
		
		var hiddenLabel = Array();
		
		hiddenLabel.value = value;
		hiddenLabel.angle = textAngle;
		hiddenLabel.search = hiddenSearchResults;
		
		this.hiddenLabels.push(hiddenLabel);
		
		drawTick(gRadius - fontSize * .75, fontSize * 1.5, textAngle);
		drawTextPolar
		(
			value.toString() + ' more',
			0, // inner text
			textAngle,
			labelRadius,
			true, // radial
			hiddenSearchResults, // bubble
			this == highlightedNode || this == focusNode, // bold
			false,
			hiddenSearchResults
		);
	}
	
	this.drawHighlight = function(bold)
	{
		var angleStartCurrent = this.angleStart.current() + rotationOffset;
		var angleEndCurrent = this.angleEnd.current() + rotationOffset;
		var radiusInner = this.radiusInner.current() * gRadius;
		
		//this.setHighlightStyle();
		
		if ( this == focusNode && this == highlightedNode && this.hasChildren() )
		{
//			context.fillStyle = "rgba(255, 255, 255, .3)";
			arrow
			(
				angleStartCurrent,
				angleEndCurrent,
				radiusInner
			);
		}
		else
		{
			drawWedge
			(
				angleStartCurrent,
				angleEndCurrent,
				radiusInner,
				gRadius,
				highlightFill,
				0,
				true
			);
		}
		
		// check if hidden children should be highlighted
		//
		for ( var i = 0; i < this.children.length; i++ )
		{
			if
			(
				this.children[i].getDepth() - selectedNode.getDepth() + 1 <=
				maxDisplayDepth &&
				this.children[i].hiddenEnd != null
			)
			{
				var firstChild = this.children[i];
				var lastChild = this.children[firstChild.hiddenEnd];
				var hiddenAngleStart = firstChild.angleStart.current() + rotationOffset;
				var hiddenAngleEnd = lastChild.angleEnd.current() + rotationOffset;
				var hiddenRadiusInner = gRadius * firstChild.radiusInner.current();
				
				drawWedge
				(
					hiddenAngleStart,
					hiddenAngleEnd,
					hiddenRadiusInner,
					gRadius,
					'rgba(255, 255, 255, .3)',
					0,
					true
				);
				
				if ( false && ! this.searchResults )
				{
					this.drawHiddenLabel
					(
						hiddenAngleStart,
						hiddenAngleEnd,
						firstChild.hiddenEnd - i + 1
					);
				}
				
				i = firstChild.hiddenEnd;
			}
		}
		
//			context.strokeStyle = 'black';
		context.fillStyle = 'black';
		
		var highlight = ! ( progress < 1 && zoomOut && this == selectedNodeLast );
		
		var angle = (angleEndCurrent + angleStartCurrent) / 2;
		
		if ( ! (this.keyed && showKeys) )
		{
			this.drawLabel(angle, true, bold, true, this.radial);
		}
	}
	
	this.drawHighlightCenter = function()
	{
		if ( ! this.canDisplayHistory() )
		{
			return;
		}
		
		context.lineWidth = highlightLineWidth;
		context.strokeStyle = 'black';
		context.fillStyle = "rgba(255, 255, 255, .6)";
		
		context.fillStyle = 'black';
		this.drawLabel(3 * Math.PI / 2, true, true, false);
		context.font = fontNormal;
	}
	
	this.drawKey = function(angle, highlight, bold)
	{
		var offset = keyOffset();
		var color;
		var colorText = this.magnitude == 0 ? 'gray' : 'black';
		var patternAlpha = this.alphaPattern.end;
		var boxLeft = imageWidth - keySize - margin;
		var textY = offset + keySize / 2;
		
		var label;
		var keyNameWidth;
		
		if ( this == selectedNode )
		{
			color = colorUnclassified;
			label =
				this.getUnclassifiedText() +
				'   ' +
				this.getUnclassifiedPercentage();
			keyNameWidth = measureText(label, false);
		}
		else
		{
			label = this.keyLabel;
			color = rgbText(this.r.end, this.g.end, this.b.end);
			
			if ( highlight )
			{
				if ( this.searchResultChildren() )
				{
					label = label + searchResultString(this.searchResultChildren());
				}
				
				keyNameWidth = measureText(label, bold);
			}
			else
			{
				keyNameWidth = this.keyNameWidth;
			}
		}
		
		var textLeft = boxLeft - keyBuffer - keyNameWidth - fontSize / 2;
		var labelLeft = textLeft;
		
		if ( labelLeft > keyMinTextLeft - fontSize / 2 )
		{
			keyMinTextLeft -= fontSize / 2;
			
			if ( keyMinTextLeft < centerX - gRadius + fontSize / 2 )
			{
				keyMinTextLeft = centerX - gRadius + fontSize / 2;
			}
			
			labelLeft = keyMinTextLeft;
		}
		
		var lineX = new Array();
		var lineY = new Array();
		
		var bendRadius;
		var keyAngle = Math.atan((textY - centerY) / (labelLeft - centerX));
		var arcAngle;
		
		if ( keyAngle < 0 )
		{
			keyAngle += Math.PI;
		}
		
		if ( keyMinAngle == 0 || angle < keyMinAngle )
		{
			keyMinAngle = angle;
		}
		
		if ( angle > Math.PI && keyMinAngle > Math.PI )
		{
			// allow lines to come underneath the chart
			
			angle -= Math.PI * 2;
		}
		
		lineX.push(Math.cos(angle) * gRadius);
		lineY.push(Math.sin(angle) * gRadius);
		
		if ( angle < keyAngle && textY > centerY + Math.sin(angle) * (gRadius + buffer * (currentKey - 1) / (keys + 1) / 2 + buffer / 2) )
		{
			bendRadius = gRadius + buffer - buffer * currentKey / (keys + 1) / 2;
		}
		else
		{
			bendRadius = gRadius + buffer * currentKey / (keys + 1) / 2 + buffer / 2;
		}
		
		var outside =
			Math.sqrt
			(
				Math.pow(labelLeft - centerX, 2) +
				Math.pow(textY - centerY, 2)
			) > bendRadius;
		
		if ( ! outside )
		{
			arcAngle = Math.asin((textY - centerY) / bendRadius);
			
			keyMinTextLeft = min(keyMinTextLeft, centerX + bendRadius * Math.cos(arcAngle) - fontSize / 2);
			
			if ( labelLeft < textLeft && textLeft > centerX + bendRadius * Math.cos(arcAngle) )
			{
				lineX.push(textLeft - centerX);
				lineY.push(textY - centerY);
			}
		}
		else
		{
			keyMinTextLeft = min(keyMinTextLeft, labelLeft - fontSize / 2);
			
			if ( angle < keyAngle )
			{
				// flip everything over y = x
				//
				arcAngle = Math.PI / 2 - keyLineAngle
				(
					Math.PI / 2 - angle,
					Math.PI / 2 - keyAngle,
					bendRadius,
					textY - centerY,
					labelLeft - centerX,
					lineY,
					lineX
				);
				
			}
			else
			{
				arcAngle = keyLineAngle
				(
					angle,
					keyAngle,
					bendRadius,
					labelLeft - centerX,
					textY - centerY,
					lineX,
					lineY
				);
			}
		}
		
		if ( labelLeft > centerX + bendRadius * Math.cos(arcAngle) ||
		textY > centerY + bendRadius * Math.sin(arcAngle) + .01)
//		if ( outside ||  )
		{
			lineX.push(labelLeft - centerX);
			lineY.push(textY - centerY);
			
			if ( textLeft != labelLeft )
			{
				lineX.push(textLeft - centerX);
				lineY.push(textY - centerY);
			}
		}
		
		context.globalAlpha = this.alphaWedge.current();
		
		if ( snapshotMode )
		{
			var labelSVG;
			
			if ( this == selectedNode )
			{
				labelSVG =
					this.getUnclassifiedText() +
					spacer() +
					this.getUnclassifiedPercentage();
			}
			else
			{
				labelSVG = this.name + spacer() + this.getPercentage() + '%';
			}
			
			svg +=
				'<rect fill="' + color + '" ' +
				'x="' + boxLeft + '" y="' + offset +
				'" width="' + keySize + '" height="' + keySize + '"/>';
			
			if ( patternAlpha )
			{
				svg +=
					'<rect fill="url(#hiddenPattern)" style="stroke:none" ' +
					'x="' + boxLeft + '" y="' + offset +
					'" width="' + keySize + '" height="' + keySize + '"/>';
			}
			
			svg +=
				'<path class="line' +
				(highlight ? ' highlight' : '') +
				'" d="M ' + (lineX[0] + centerX) + ',' +
				(lineY[0] + centerY);
			
			if ( angle != arcAngle )
			{
				svg +=
					' L ' + (centerX + bendRadius * Math.cos(angle)) + ',' +
					(centerY + bendRadius * Math.sin(angle)) +
					' A ' + bendRadius + ',' + bendRadius + ' 0 ' +
					'0,' + (angle > arcAngle ? '0' : '1') + ' ' +
					(centerX + bendRadius * Math.cos(arcAngle)) + ',' +
					(centerY + bendRadius * Math.sin(arcAngle));
			}
			
			for ( var i = 1; i < lineX.length; i++ )
			{
				svg +=
					' L ' + (centerX + lineX[i]) + ',' +
					(centerY + lineY[i]);
			}
			
			svg += '"/>';
			
			if ( highlight )
			{
				if ( this.searchResultChildren() )
				{
					labelSVG = labelSVG + searchResultString(this.searchResultChildren());
				}
				
				drawBubbleSVG
				(
					boxLeft - keyBuffer - keyNameWidth - fontSize / 2,
					textY - fontSize,
					keyNameWidth + fontSize,
					fontSize * 2,
					fontSize,
					0
				);
				
				if ( this.isSearchResult )
				{
					drawSearchHighlights
					(
						label,
						boxLeft - keyBuffer - keyNameWidth,
						textY,
						0
					)
				}
			}
			
			svg += svgText(labelSVG, boxLeft - keyBuffer, textY, 'end', bold, colorText);
		}
		else
		{
			context.fillStyle = color;
			context.translate(-centerX, -centerY);
			context.strokeStyle = 'black';
				context.globalAlpha = 1;//this.alphaWedge.current();
			
			context.fillRect(boxLeft, offset, keySize, keySize);
			
			if ( patternAlpha )
			{
				context.globalAlpha = patternAlpha;
				context.fillStyle = hiddenPattern;
				
				// make clipping box for Firefox performance
				context.beginPath();
				context.moveTo(boxLeft, offset);
				context.lineTo(boxLeft + keySize, offset);
				context.lineTo(boxLeft + keySize, offset + keySize);
				context.lineTo(boxLeft, offset + keySize);
				context.closePath();
				context.save();
				context.clip();
				
				context.fillRect(boxLeft, offset, keySize, keySize);
				context.fillRect(boxLeft, offset, keySize, keySize);
				
				context.restore(); // remove clipping region
			}
			
			if ( highlight )
			{
				this.setHighlightStyle();
				context.fillRect(boxLeft, offset, keySize, keySize);
			}
			else
			{
				context.lineWidth = thinLineWidth;
			}
			
			context.strokeRect(boxLeft, offset, keySize, keySize);
			
			if ( lineX.length )
			{
				context.beginPath();
				context.moveTo(lineX[0] + centerX, lineY[0] + centerY);
				
				context.arc(centerX, centerY, bendRadius, angle, arcAngle, angle > arcAngle);
				
				for ( var i = 1; i < lineX.length; i++ )
				{
					context.lineTo(lineX[i] + centerX, lineY[i] + centerY);
				}
				
				context.globalAlpha = this == selectedNode ?
					this.children[0].alphaWedge.current() :
					this.alphaWedge.current();
				context.lineWidth = highlight ? highlightLineWidth : thinLineWidth;
				context.stroke();
				context.globalAlpha = 1;
			}
			
			if ( highlight )
			{
				drawBubbleCanvas
				(
					boxLeft - keyBuffer - keyNameWidth - fontSize / 2,
					textY - fontSize,
					keyNameWidth + fontSize,
					fontSize * 2,
					fontSize,
					0
				);
				
				if ( this.isSearchResult )
				{
					drawSearchHighlights
					(
						label,
						boxLeft - keyBuffer - keyNameWidth,
						textY,
						0
					)
				}
			}
			
			drawText(label, boxLeft - keyBuffer, offset + keySize / 2, 0, 'end', bold, colorText);
			
			context.translate(centerX, centerY);
		}
		
		currentKey++;
	}
	
	this.drawLabel = function(angle, bubble, bold, selected, radial)
	{
		if ( context.globalAlpha == 0 )
		{
			return;
		}
		
		var innerText;
		var label;
		var radius;
		
		if ( radial )
		{
			radius = (this.radiusInner.current() + 1) * gRadius / 2;
		}
		else
		{
			radius = this.labelRadius.current() * gRadius;
		}
		
		if ( radial && (selected || bubble ) )
		{
			var percentage = this.getPercentage();
			innerText = percentage + '%';
		}
		
		if
		(
			! radial &&
			this != selectedNode &&
			! bubble &&
			( !zoomOut || this != selectedNodeLast)
		)
		{
			label = this.shortenLabel();
		}
		else
		{
			label = this.name;
		}
		
		if (showMagnitude)
		{
    		label += ' [' + this.magnitude + ']'
    	}
		
		var flipped = drawTextPolar
		(
			label,
			innerText,
			angle,
			radius,
			radial,
			bubble,
			bold,
//			this.isSearchResult && this.shouldAddSearchResultsString() && (!selected || this == selectedNode || highlight),
			this.isSearchResult && (!selected || this == selectedNode || bubble),
			(this.hideAlone || !selected || this == selectedNode ) ? this.searchResultChildren() : 0
		);
		
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
		
		if
		(
			! radial &&
			! bubble &&
			this != selectedNode &&
			this.angleEnd.end != this.angleStart.end &&
			nLabelOffsets[depth - 2] > 2 &&
			this.labelWidth.current() > (this.angleEnd.end - this.angleStart.end) * Math.abs(radius) &&
			! ( zoomOut && this == selectedNodeLast ) &&
			this.labelRadius.end > 0
		)
		{
			// name extends beyond wedge; draw tick mark towards the central
			// radius for easier identification
			
			var radiusCenter = compress ?
				(compressedRadii[depth - 1] + compressedRadii[depth - 2]) / 2 :
				(depth - .5) * nodeRadius;
			
			if ( this.labelRadius.end > radiusCenter )
			{
				if ( flipped )
				{
					drawTick(radius - tickLength * 1.4 , tickLength, angle);
				}
				else
				{
					drawTick(radius - tickLength * 1.7, tickLength, angle);
				}
			}
			else
			{
				if ( flipped )
				{
					drawTick(radius + tickLength * .7, tickLength, angle);
				}
				else
				{
					drawTick(radius + tickLength * .4, tickLength, angle);
				}
			}
		}
	}
	
	this.drawLines = function(angleStart, angleEnd, radiusInner, drawRadial, selected)
	{
		if ( snapshotMode )
		{
			if ( this != selectedNode)
			{
				if ( angleEnd == angleStart + Math.PI * 2 )
				{
					// fudge to prevent overlap, which causes arc ambiguity
					//
					angleEnd -= .1 / gRadius;
				}
				
				var longArc = angleEnd - angleStart > Math.PI ? 1 : 0;
				
				var x1 = centerX + radiusInner * Math.cos(angleStart);
				var y1 = centerY + radiusInner * Math.sin(angleStart);
				
				var x2 = centerX + gRadius * Math.cos(angleStart);
				var y2 = centerY + gRadius * Math.sin(angleStart);
				
				var x3 = centerX + gRadius * Math.cos(angleEnd);
				var y3 = centerY + gRadius * Math.sin(angleEnd);
				
				var x4 = centerX + radiusInner * Math.cos(angleEnd);
				var y4 = centerY + radiusInner * Math.sin(angleEnd);
				
				if ( this.alphaArc.end )
				{
					var dArray =
					[
						" M ", x4, ",", y4,
						" A ", radiusInner, ",", radiusInner, " 0 ", longArc,
							" 0 ", x1, ",", y1
					];
					
					svg += '<path class="line" d="' + dArray.join('') + '"/>';
				}
				
				if ( drawRadial && this.alphaLine.end )
				{
					svg += '<line x1="' + x3 + '" y1="' + y3 + '" x2="' + x4 + '" y2="' + y4 + '"/>';
				}
			}
		}
		else
		{
			context.lineWidth = thinLineWidth;
			context.strokeStyle = 'black';
			context.beginPath();
			context.arc(0, 0, radiusInner, angleStart, angleEnd, false);
			context.globalAlpha = this.alphaArc.current();
			context.stroke();
			
			if ( drawRadial )
			{
				var x1 = radiusInner * Math.cos(angleEnd);
				var y1 = radiusInner * Math.sin(angleEnd);
				var x2 = gRadius * Math.cos(angleEnd);
				var y2 = gRadius * Math.sin(angleEnd);
				
				context.beginPath();
				context.moveTo(x1, y1);
				context.lineTo(x2, y2);
				
//				if ( this.getCollapse() )//( selected && this != selectedNode )
				{
					context.globalAlpha = this.alphaLine.current();
				}
				
				context.stroke();
			}
		}
	}
	
	this.drawMap = function(child)
	{
		if ( this.parent )
		{
			this.parent.drawMap(child);
		}
		
		if ( this.getCollapse() && this != child || this == focusNode )
		{
			return;
		}
		
		var angleStart =
			(child.baseMagnitude - this.baseMagnitude) / this.magnitude * Math.PI * 2 +
			rotationOffset;
		var angleEnd =
			(child.baseMagnitude - this.baseMagnitude + child.magnitude) /
			this.magnitude * Math.PI * 2 +
			rotationOffset;
		
		var box = this.getMapPosition();
		
		context.save();
		context.fillStyle = 'black';
		context.textAlign = 'end';
		context.textBaseline = 'middle';
		
		var textX = box.x - mapRadius - mapBuffer;
		var percentage = getPercentage(child.magnitude / this.magnitude);
		
		var highlight = this == selectedNode || this == highlightedNode;
		
		if ( highlight )
		{
			context.font = fontBold;
		}
		else
		{
			context.font = fontNormal;
		}
		
		context.fillText(percentage + '% of', textX, box.y - mapRadius / 3);
		context.fillText(this.name, textX, box.y + mapRadius / 3);
		
		if ( highlight )
		{
			context.font = fontNormal;
		}
		
		if ( this == highlightedNode && this != selectedNode )
		{
			context.fillStyle = 'rgb(245, 245, 245)';
//			context.fillStyle = 'rgb(200, 200, 200)';
		}
		else
		{
			context.fillStyle = 'rgb(255, 255, 255)';
		}
		
		context.beginPath();
		context.arc(box.x, box.y, mapRadius, 0, Math.PI * 2, true);
		context.closePath();
		context.fill();
		
		if ( this == selectedNode )
		{
			context.lineWidth = 1;
			context.fillStyle = 'rgb(100, 100, 100)';
		}
		else
		{
			if ( this == highlightedNode )
			{
				context.lineWidth = .2;
				context.fillStyle = 'rgb(190, 190, 190)';
			}
			else
			{
				context.lineWidth = .2;
				context.fillStyle = 'rgb(200, 200, 200)';
			}
		}
		
		var maxDepth = this.getMaxDepth();
		
		if ( ! compress && maxDepth > maxPossibleDepth + this.getDepth() - 1 )
		{
			maxDepth = maxPossibleDepth + this.getDepth() - 1;
		}
		
		if ( this.getDepth() < selectedNode.getDepth() )
		{
			if ( child.getDepth() - 1 >= maxDepth )
			{
				maxDepth = child.getDepth();
			}
		}
		
		var radiusInner;
		
		if ( compress )
		{
			radiusInner = 0;
//				Math.atan(child.getDepth() - this.getDepth()) /
//				Math.PI * 2 * .9;
		}
		else
		{
			radiusInner =
				(child.getDepth() - this.getDepth()) /
				(maxDepth - this.getDepth() + 1);
		}
		
		context.stroke();
		context.beginPath();
		
		if ( radiusInner == 0 )
		{
			context.moveTo(box.x, box.y);
		}
		else
		{
			context.arc(box.x, box.y, mapRadius * radiusInner, angleEnd, angleStart, true);
		}
		
		context.arc(box.x, box.y, mapRadius, angleStart, angleEnd, false);
		context.closePath();
		context.fill();
		
		if ( this == highlightedNode && this != selectedNode )
		{
			context.lineWidth = 1;
			context.stroke();
		}
		
		context.restore();
	}
	
	this.drawReferenceRings = function(childRadiusInner)
	{
		if ( snapshotMode )
		{
			svg +=
				'<circle cx="' + centerX + '" cy="' + centerY +
				'" r="' + childRadiusInner + '"/>';
			svg +=
				'<circle cx="' + centerX + '" cy="' + centerY +
				'" r="' + gRadius + '"/>';
		}
		else
		{
			context.globalAlpha = 1 - this.alphaLine.current();//this.getUncollapsed().alphaLine.current();
			context.beginPath();
			context.arc(0, 0, childRadiusInner, 0, Math.PI * 2, false);
			context.stroke();
			context.beginPath();
			context.arc(0, 0, gRadius, 0, Math.PI * 2, false);
			context.stroke();
		}
	}
	
	this.getCollapse = function()
	{
		return (
			collapse &&
			this.collapse &&
			this.depth != maxAbsoluteDepth
			);
	}
	
	this.getDepth = function()
	{
		if ( collapse )
		{
			return this.depthCollapsed;
		}
		else
		{
			return this.depth;
		}
	}
	
	this.getMagnitude = function()
	{
		return this.attributes[magnitudeIndex][currentDataset];
	}
	
	this.getMapPosition = function()
	{
		return {
			x : (details.offsetLeft + details.clientWidth - mapRadius),
			y : ((focusNode.getDepth() - this.getDepth()) *
				(mapBuffer + mapRadius * 2) - mapRadius) +
				details.clientHeight + details.offsetTop
		};
	}
	
	this.getMaxDepth = function(limit)
	{
		var max;
		
		if ( collapse )
		{
			return this.maxDepthCollapsed;
		}
		else
		{
			if ( this.maxDepth > maxAbsoluteDepth )
			{
				return maxAbsoluteDepth;
			}
			else
			{
				return this.maxDepth;
			}
		}
	}
	
	this.getData = function(index, summary)
	{
		var files = new Array();
		
		if
		(
			this.attributes[index] != null &&
			this.attributes[index][currentDataset] != null &&
			this.attributes[index][currentDataset] != ''
		)
		{
			files.push
			(
				document.location +
				'.files/' +
				this.attributes[index][currentDataset]
			);
		}
		
		if ( summary )
		{
			for ( var i = 0; i < this.children.length; i++ )
			{
				files = files.concat(this.children[i].getData(index, true));
			}
		}
		
		return files;
	}
	
	this.getList = function(index, summary)
	{
		var list;
		
		if
		(
			this.attributes[index] != null &&
			this.attributes[index][currentDataset] != null
		)
		{
			list = this.attributes[index][currentDataset];
		}
		else
		{
			list = new Array();
		}
		
		if ( summary )
		{
			for ( var i = 0; i < this.children.length; i++ )
			{
				list = list.concat(this.children[i].getList(index, true));
			}
		}
		
		return list;
	}
	
	this.getParent = function()
	{
		// returns parent, accounting for collapsing or 0 if doesn't exist
		
		var parent = this.parent;
		
		while ( parent != 0 && parent.getCollapse() )
		{
			parent = parent.parent;
		}
		
		return parent;
	}
	
	this.getPercentage = function()
	{
		return getPercentage(this.magnitude / selectedNode.magnitude);
	}
	
	this.getUnclassifiedPercentage = function()
	{
		if ( this.children.length )
		{
			var lastChild = this.children[this.children.length - 1];
		
			return getPercentage
			(
				(
					this.baseMagnitude +
					this.magnitude -
					lastChild.magnitude -
					lastChild.baseMagnitude
				) / this.magnitude
			) + '%';
		}
		else
		{
			return '100%';
		}
	}
	
	this.getUnclassifiedText = function()
	{
		return '[other '+ this.name + ']';
	}
	
	this.getUncollapsed = function()
	{
		// recurse through collapsed children until uncollapsed node is found
		
		if ( this.getCollapse() )
		{
			return this.children[0].getUncollapsed();
		}
		else
		{
			return this;
		}
	}
	
	this.hasChildren = function()
	{
		return this.children.length && this.depth < maxAbsoluteDepth && this.magnitude;
	}
	
	this.hasParent = function(parent)
	{
		if ( this.parent )
		{
			if ( this.parent == parent )
			{
				return true;
			}
			else
			{
				return this.parent.hasParent(parent);
			}
		}
		else
		{
			return false;
		}
	}
	
	this.maxVisibleDepth = function(maxDepth)
	{
		var childInnerRadius;
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
		var currentMaxDepth = depth;
		
		if ( this.hasChildren() && depth < maxDepth)
		{
			var lastChild = this.children[this.children.length - 1];
			
			if ( this.name == 'Pseudomonadaceae' )
			{
				var x = 3;
			}
			
			if
			(
				lastChild.baseMagnitude + lastChild.magnitude <
				this.baseMagnitude + this.magnitude
			)
			{
				currentMaxDepth++;
			}
			
			if ( compress )
			{
				childInnerRadius = compressedRadii[depth - 1];
			}
			else
			{
				childInnerRadius = (depth) / maxDepth;
			}
			
			for ( var i = 0; i < this.children.length; i++ )
			{
				if
				(//true ||
					this.children[i].magnitude *
					angleFactor *
					(childInnerRadius + 1) *
					gRadius >=
					minWidth()
				)
				{
					var childMaxDepth = this.children[i].maxVisibleDepth(maxDepth);
					
					if ( childMaxDepth > currentMaxDepth )
					{
						currentMaxDepth = childMaxDepth;
					}
				}
			}
		}
		
		return currentMaxDepth;
	}
	
	this.resetLabelWidth = function()
	{
		var nameWidthOld = this.nameWidth;
		
		if ( true || ! this.radial )//&& fontSize != fontSizeLast )
		{
			var dim = context.measureText(this.name);
			this.nameWidth = dim.width;
		}
		
		if ( fontSize != fontSizeLast && this.labelWidth.end == nameWidthOld * labelWidthFudge )
		{
			// font size changed; adjust start of tween to match
			
			this.labelWidth.start = this.nameWidth * labelWidthFudge;
		}
		else
		{
			this.labelWidth.start = this.labelWidth.current();
		}
		
		this.labelWidth.end = this.nameWidth * labelWidthFudge;
	}
	
	this.restrictLabelWidth = function(width)
	{
		if ( width < this.labelWidth.end )
		{
			this.labelWidth.end = width;
		}
	}
	
	this.search = function()
	{
		this.isSearchResult = false;
		this.searchResults = 0;
		
		if
		(
			! this.getCollapse() &&
			search.value != '' &&
			this.name.toLowerCase().indexOf(search.value.toLowerCase()) != -1
		)
		{
			this.isSearchResult = true;
			this.searchResults = 1;
			nSearchResults++;
		}
		
		for ( var i = 0; i < this.children.length; i++ )
		{
			this.searchResults += this.children[i].search();
		}
		
		return this.searchResults;
	}
	
	this.searchResultChildren = function()
	{
		if ( this.isSearchResult )
		{
			return this.searchResults - 1;
		}
		else
		{
			return this.searchResults;
		}
	}
	
	this.setDepth = function(depth, depthCollapsed)
	{
		this.depth = depth;
		this.depthCollapsed = depthCollapsed;
		
		if
		(
			this.children.length == 1 &&
//			this.magnitude > 0 &&
			this.children[0].magnitude == this.magnitude &&
			( head.children.length > 1 || this.children[0].children.length )
		)
		{
			this.collapse = true;
		}
		else
		{
			this.collapse = false;
			depthCollapsed++;
		}
		
		for ( var i = 0; i < this.children.length; i++ )
		{
			this.children[i].setDepth(depth + 1, depthCollapsed);
		}
	}
	
	this.setHighlightStyle = function()
	{
		context.lineWidth = highlightLineWidth;
		
		if ( this.hasChildren() || this != focusNode || this != highlightedNode )
		{
			context.strokeStyle = 'black';
			context.fillStyle = "rgba(255, 255, 255, .3)";
		}
		else
		{
			context.strokeStyle = 'rgb(90,90,90)';
			context.fillStyle = "rgba(155, 155, 155, .3)";
		}
	}
	
	this.setLabelWidth = function(node)
	{
		if ( ! shorten || this.radial )
		{
			return; // don't need to set width
		}
		
		if ( node.hide )
		{
			alert('wtf');
			return;
		}
		
		var angle = (this.angleStart.end + this.angleEnd.end) / 2;
		var a; // angle difference
		
		if ( node == selectedNode )
		{
			a = Math.abs(angle - node.angleOther);
		}
		else
		{
			a = Math.abs(angle - (node.angleStart.end + node.angleEnd.end) / 2);
		}
		
		if ( a == 0 )
		{
			return;
		}
		
		if ( a > Math.PI )
		{
			a = 2 * Math.PI - a;
		}
		
		if ( node.radial || node == selectedNode )
		{
			var nodeLabelRadius;
			
			if ( node == selectedNode )
			{
				// radial 'other' label
				
				nodeLabelRadius = (node.children[0].radiusInner.end + 1) / 2;
			}
			else
			{
				nodeLabelRadius = (node.radiusInner.end + 1) / 2;
			}
			
			if ( a < Math.PI / 2 )
			{
				var r = this.labelRadius.end * gRadius + .5 * fontSize
				var hypotenuse = r / Math.cos(a);
				var opposite = r * Math.tan(a);
				var fontRadius = .8 * fontSize;
				
				if
				(
					nodeLabelRadius * gRadius < hypotenuse &&
					this.labelWidth.end / 2 + fontRadius > opposite
				)
				{
					this.labelWidth.end = 2 * (opposite - fontRadius);
				}
			}
		}
		else if
		(
			this.labelRadius.end == node.labelRadius.end &&
			a < Math.PI / 4
		)
		{
			// same radius with small angle; use circumferential approximation
			
			var dist = a * this.labelRadius.end * gRadius - fontSize * (1 - a * 4 / Math.PI) * 1.3;
			
			if ( this.labelWidth.end < dist )
			{
				node.restrictLabelWidth((dist - this.labelWidth.end / 2) * 2);
			}
			else if ( node.labelWidth.end < dist )
			{
				this.restrictLabelWidth((dist - node.labelWidth.end / 2) * 2);
			}
			else
			{
				// both labels reach halfway point; restrict both
				
				this.labelWidth.end = dist;
				node.labelWidth.end = dist
			}
		}
		else
		{
			var r1 = this.labelRadius.end * gRadius;
			var r2 = node.labelRadius.end * gRadius;
			
			// first adjust the radii to account for the height of the font by shifting them
			// toward each other
			//
			var fontFudge = .35 * fontSize;
			//
			if ( this.labelRadius.end < node.labelRadius.end )
			{
				r1 += fontFudge;
				r2 -= fontFudge;
			}
			else if ( this.labelRadius.end > node.labelRadius.end )
			{
				r1 -= fontFudge;
				r2 += fontFudge;
			}
			else
			{
				r1 -= fontFudge;
				r2 -= fontFudge;
			}
			
			var r1s = r1 * r1;
			var r2s = r2 * r2;
			
			// distance between the centers of the two labels
			//
			var dist = Math.sqrt(r1s + r2s - 2 * r1 * r2 * Math.cos(a));
			
			// angle at our label center between our radius and the line to the other label center
			//
			var b = Math.acos((r1s + dist * dist - r2s) / (2 * r1 * dist));
			
			// distance from our label center to the intersection of the two tangents
			//
			var l1 = Math.sin(a + b - Math.PI / 2) * dist / Math.sin(Math.PI - a);
			
			// distance from other label center the the intersection of the two tangents
			//
			var l2 = Math.sin(Math.PI / 2 - b) * dist / Math.sin(Math.PI - a);
			
			l1 = Math.abs(l1) - .4 * fontSize;
			l2 = Math.abs(l2) - .4 * fontSize;
/*			
			// amount to shorten the distances because of the height of the font
			//
			var l3 = 0;
			var fontRadius = fontSize * .55;
			//
			if ( l1 < 0 || l2 < 0 )
			{
				var l4 = fontRadius / Math.tan(a);
			l1 = Math.abs(l1);
			l2 = Math.abs(l2);
			
				l1 -= l4;
				l2 -= l4;
			}
			else
			{
				var c = Math.PI - a;
				
				l3 = fontRadius * Math.tan(c / 2);
			}
*/			
			if ( this.labelWidth.end / 2 > l1 && node.labelWidth.end / 2 > l2 )
			{
				// shorten the farthest one from the intersection
				
				if ( l1 > l2 )
				{
					this.restrictLabelWidth(2 * (l1));// - l3 - fontRadius));
				}
				else
				{
					node.restrictLabelWidth(2 * (l2));// - l3 - fontRadius));
				}
			}/*
			else if ( this.labelWidth.end / 2 > l1 + l3 && node.labelWidth.end / 2 > l2 - l3 )
			{
				node.restrictLabelWidth(2 * (l2 - l3));
			}
			else if ( this.labelWidth.end / 2 > l1 - l3 && node.labelWidth.end / 2 > l2 + l3 )
			{
				this.restrictLabelWidth(2 * (l1 - l3));
			}*/
		}
	}
	
	this.setMagnitudes = function(baseMagnitude)
	{
		this.magnitude = this.getMagnitude();
		this.baseMagnitude = baseMagnitude;
		
		for ( var i = 0; i < this.children.length; i++ )
		{
			this.children[i].setMagnitudes(baseMagnitude);
			baseMagnitude += this.children[i].magnitude;
		}
		
		this.maxChildMagnitude = baseMagnitude;
	}
	
	this.setMaxDepths = function()
	{
		this.maxDepth = this.depth;
		this.maxDepthCollapsed = this.depthCollapsed;
		
		for ( i in this.children )
		{
			var child = this.children[i];
			
			child.setMaxDepths();
			
			if ( child.maxDepth > this.maxDepth )
			{
				this.maxDepth = child.maxDepth;
			}
			
			if
			(
				child.maxDepthCollapsed > this.maxDepthCollapsed &&
				(child.depth <= maxAbsoluteDepth || maxAbsoluteDepth == 0)
			)
			{
				this.maxDepthCollapsed = child.maxDepthCollapsed;
			}
		}
	}
	
	this.setTargetLabelRadius = function()
	{
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
		var index = depth - 2;
		var labelOffset = labelOffsets[index];
		
		if ( this.radial )
		{
			//this.labelRadius.setTarget((this.radiusInner.end + 1) / 2);
			var max =
				depth == maxDisplayDepth ?
				1 :
				compressedRadii[index + 1];
			
			this.labelRadius.setTarget((compressedRadii[index] + max) / 2);
		}
		else
		{
			var radiusCenter;
			var width;
			
			if ( compress )
			{
				if ( nLabelOffsets[index] > 1 )
				{
					this.labelRadius.setTarget
					(
						lerp
						(
							labelOffset + .75,
							0,
							nLabelOffsets[index] + .5,
							compressedRadii[index],
							compressedRadii[index + 1]
						)
					);
				}
				else
				{
					this.labelRadius.setTarget((compressedRadii[index] + compressedRadii[index + 1]) / 2);
				}
			}
			else
			{
				radiusCenter =
					nodeRadius * (depth - 1) +
					nodeRadius / 2;
				width = nodeRadius;
				
				this.labelRadius.setTarget
				(
					radiusCenter + width * ((labelOffset + 1) / (nLabelOffsets[index] + 1) - .5)
				);
			}
		}
		
		if ( ! this.hide && ! this.keyed && nLabelOffsets[index] )
		{
			// check last and first labels in each track for overlap
			
			for ( var i = 0; i < maxDisplayDepth - 1; i++ )
			{
				for ( var j = 0; j <= nLabelOffsets[i]; j++ )
				{
					var last = labelLastNodes[i][j];
					var first = labelFirstNodes[i][j];
					
					if ( last )
					{
						if ( j == nLabelOffsets[i] )
						{
							// last is radial
							this.setLabelWidth(last);
						}
						else
						{
							last.setLabelWidth(this);
						}
					}
					
					if ( first )
					{
						if ( j == nLabelOffsets[i] )
						{
							this.setLabelWidth(first);
						}
						else
						{
							first.setLabelWidth(this);
						}
					}
				}
			}
			
			if ( selectedNode.canDisplayLabelOther )
			{
				this.setLabelWidth(selectedNode); // in case there is an 'other' label
			}
			
			if ( this.radial )
			{
				// use the last 'track' of this depth for radial
				
				labelLastNodes[index][nLabelOffsets[index]] = this;
				
				if ( labelFirstNodes[index][nLabelOffsets[index]] == 0 )
				{
					labelFirstNodes[index][nLabelOffsets[index]] = this;
				}
			}
			else
			{
				labelLastNodes[index][labelOffset] = this;
				
				// update offset
				
				labelOffsets[index] += 1;
				
				if ( labelOffsets[index] > nLabelOffsets[index] )
				{
					labelOffsets[index] -= nLabelOffsets[index];
					
					if ( !(nLabelOffsets[index] & 1) )
					{
						labelOffsets[index]--;
					}
				}
				else if ( labelOffsets[index] == nLabelOffsets[index] )
				{
					labelOffsets[index] -= nLabelOffsets[index];
					
					if ( false && !(nLabelOffsets[index] & 1) )
					{
						labelOffsets[index]++;
					}
				}
				
				if ( labelFirstNodes[index][labelOffset] == 0 )
				{
					labelFirstNodes[index][labelOffset] = this;
				}
			}
		}
		else if ( this.hide )
		{
			this.labelWidth.end = 0;
		}
	}
	
	this.setTargets = function()
	{
		if ( this == selectedNode )
		{
			this.setTargetsSelected
			(
				0,
				1,
				lightnessBase,
				false,
				false
			);
			return;
		}
		
		var depthRelative = this.getDepth() - selectedNode.getDepth();
		
		var parentOfSelected = selectedNode.hasParent(this);
/*		(
//			! this.getCollapse() &&
			this.baseMagnitude <= selectedNode.baseMagnitude &&
			this.baseMagnitude + this.magnitude >=
			selectedNode.baseMagnitude + selectedNode.magnitude
		);
*/		
		if ( parentOfSelected )
		{
			this.resetLabelWidth();
		}
		else
		{
			//context.font = fontNormal;
			var dim = context.measureText(this.name);
			this.nameWidth = dim.width;
			//this.labelWidth.setTarget(this.labelWidth.end);
			this.labelWidth.setTarget(0);
		}
		
		// set angles
		//
		if ( this.baseMagnitude <= selectedNode.baseMagnitude )
		{
			this.angleStart.setTarget(0);
		}
		else
		{
			this.angleStart.setTarget(Math.PI * 2);
		}
		//
		if
		(
			parentOfSelected ||
			this.baseMagnitude + this.magnitude >=
			selectedNode.baseMagnitude + selectedNode.magnitude
		)
		{
			this.angleEnd.setTarget(Math.PI * 2);
		}
		else
		{
			this.angleEnd.setTarget(0);
		}
		
		// children
		//
		for ( var i = 0; i < this.children.length; i++ )
		{
			this.children[i].setTargets();
		}
		
		if ( this.getDepth() <= selectedNode.getDepth() )
		{
			// collapse in
			
			this.radiusInner.setTarget(0);
			
			if ( parentOfSelected )
			{
				this.labelRadius.setTarget
				(
					(depthRelative) *
					historySpacingFactor * fontSize / gRadius
				);
				//this.scale.setTarget(1 - (selectedNode.getDepth() - this.getDepth()) / 18); // TEMP
			}
			else
			{
				this.labelRadius.setTarget(0);
				//this.scale.setTarget(1); // TEMP
			}
		}
		else if ( depthRelative + 1 > maxDisplayDepth )
		{
			// collapse out
			
			this.radiusInner.setTarget(1);
			this.labelRadius.setTarget(1);
			//this.scale.setTarget(1); // TEMP
		}
		else
		{
			// don't collapse
			
			if ( compress )
			{
				this.radiusInner.setTarget(compressedRadii[depthRelative - 1]);
			}
			else
			{
				this.radiusInner.setTarget(nodeRadius * (depthRelative));
			}
			
			//this.scale.setTarget(1); // TEMP
			
			if ( this == selectedNode )
			{
				this.labelRadius.setTarget(0);
			}
			else
			{
				if ( compress )
				{
					this.labelRadius.setTarget
					(
						(compressedRadii[depthRelative - 1] + compressedRadii[depthRelative]) / 2
					);
				}
				else
				{
					this.labelRadius.setTarget(nodeRadius * (depthRelative) + nodeRadius / 2);
				}
			}
		}
		
//		this.r.start = this.r.end;
//		this.g.start = this.g.end;
//		this.b.start = this.b.end;
		
		this.r.setTarget(255);
		this.g.setTarget(255);
		this.b.setTarget(255);

		this.alphaLine.setTarget(0);
		this.alphaArc.setTarget(0);
		this.alphaWedge.setTarget(0);
		this.alphaPattern.setTarget(0);
		this.alphaOther.setTarget(0);
		
		if ( parentOfSelected && ! this.getCollapse() )
		{
			var alpha =
			(
				1 -
				(selectedNode.getDepth() - this.getDepth()) /
				(Math.floor((compress ? compressedRadii[0] : nodeRadius) * gRadius / (historySpacingFactor * fontSize) - .5) + 1)
			);
			
			if ( alpha < 0 )
			{
				alpha = 0;
			}
			
			this.alphaLabel.setTarget(alpha);
			this.radial = false;
		}
		else
		{
			this.alphaLabel.setTarget(0);
		}
		
		this.hideAlonePrev = this.hideAlone;
		this.hidePrev = this.hide;
		
		if ( parentOfSelected )
		{
			this.hideAlone = false;
			this.hide = false;
		}
		
		if ( this.getParent() == selectedNode.getParent() )
		{
			this.hiddenEnd = null;
		}
		
		this.radialPrev = this.radial;
	}
	
	this.setTargetsSelected = function(hueMin, hueMax, lightness, hide, nextSiblingHidden)
	{
		var collapse = this.getCollapse();
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
		var canDisplayChildLabels = false;
		var lastChild;
		
		if ( this.hasChildren() )//&& ! hide )
		{
			lastChild = this.children[this.children.length - 1];
			this.hideAlone = true;
		}
		else
		{
			this.hideAlone = false;
		}
		
		// set child wedges
		//
		for ( var i = 0; i < this.children.length; i++ )
		{
			this.children[i].setTargetWedge();
			
			if
			(
				! this.children[i].hide &&
				( collapse || depth < maxDisplayDepth ) &&
				this.depth < maxAbsoluteDepth
			)
			{
				canDisplayChildLabels = true;
				this.hideAlone = false;
			}
		}
		
		if ( this == selectedNode || lastChild && lastChild.angleEnd.end < this.angleEnd.end - .01)
		{
			this.hideAlone = false;
		}
		
		if ( this.hideAlonePrev == undefined )
		{
			this.hideAlonePrev = this.hideAlone;
		}
		
		if ( this == selectedNode )
		{
			var otherArc = 
				this.children.length ?
					angleFactor *
					(
						this.baseMagnitude + this.magnitude -
						lastChild.baseMagnitude - lastChild.magnitude
					)
				: this.baseMagnitude + this.magnitude;
			this.canDisplayLabelOther =
				this.children.length ?
					otherArc *
					(this.children[0].radiusInner.end + 1) * gRadius >=
					minWidth()
				: true;
			
			this.keyUnclassified = false;
			
			if ( this.canDisplayLabelOther )
			{
				this.angleOther = Math.PI * 2 - otherArc / 2;
			}
			else if ( otherArc > 0.0000000001 )
			{
				this.keyUnclassified = true;
				keys++;
			}
			
			this.angleStart.setTarget(0);
			this.angleEnd.setTarget(Math.PI * 2);
			
			if ( this.children.length )
			{
				this.radiusInner.setTarget(0);
			}
			else
			{
				this.radiusInner.setTarget(compressedRadii[0]);
			}
			
			this.hidePrev = this.hide;
			this.hide = false;
			this.hideAlonePrev = this.hideAlone;
			this.hideAlone = false;
			this.keyed = false;
		}
		
		if ( hueMax - hueMin > 1 / 12 )
		{
			hueMax = hueMin + 1 / 12;
		}
		
		// set lightness
		//
		if ( ! ( hide || this.hideAlone ) )
		{
			if ( useHue() )
			{
				lightness = (lightnessBase + lightnessMax) / 2;
			}
			else
			{
				lightness = lightnessBase + (depth - 1) * lightnessFactor;
				
				if ( lightness > lightnessMax )
				{
					lightness = lightnessMax;
				}
			}
		}
		
		if ( hide )
		{
			this.hide = true;
		}
		
		if ( this.hidePrev == undefined )
		{
			this.hidePrev = this.hide;
		}
		
		var hiddenStart = -1;
		var hiddenHueNumer = 0;
		var hiddenHueDenom = 0;
		var i = 0;
		
		if ( ! this.hide )
		{
			this.hiddenEnd = null;
		}
		
		while ( true )
		{
			if ( ! this.hideAlone && ! hide && ( i == this.children.length || ! this.children[i].hide ) )
			{
				// reached a non-hidden child or the end; set targets for
				// previous group of hidden children (if any) using their
				// average hue
				
				if ( hiddenStart != -1 )
				{
					var hiddenHue = hiddenHueDenom ? hiddenHueNumer / hiddenHueDenom : hueMin;
					
					for ( var j = hiddenStart; j < i; j++ )
					{
						this.children[j].setTargetsSelected
						(
							hiddenHue,
							null,
							lightness,
							false,
							j < i - 1
						);
						
						this.children[j].hiddenEnd = null;
					}
					
					this.children[hiddenStart].hiddenEnd = i - 1;
				}
			}
			
			if ( i == this.children.length )
			{
				break;
			}
			
			var child = this.children[i];
			var childHueMin;
			var childHueMax;
			
			if ( this.magnitude > 0 && ! this.hide && ! this.hideAlone )
			{
				if ( useHue() )
				{
					childHueMin = child.hues[currentDataset];
				}
				else if ( this == selectedNode )
				{
					var min = 0.0;
					var max = 1.0;
					
					if ( this.children.length > 6 )
					{
						childHueMin = lerp((1 - Math.pow(1 - i / this.children.length, 1.4)) * .95, 0, 1, min, max);
						childHueMax = lerp((1 - Math.pow(1 - (i + .55) / this.children.length, 1.4)) * .95, 0, 1, min, max);
					}
					else
					{
						childHueMin = lerp(i / this.children.length, 0, 1, min, max);
						childHueMax = lerp((i + .55) / this.children.length, 0, 1, min, max);
					}
				}
				else
				{
					childHueMin = lerp
					(
						child.baseMagnitude,
						this.baseMagnitude, 
						this.baseMagnitude + this.magnitude,
						hueMin,
						hueMax
					);
					childHueMax = lerp
					(
						child.baseMagnitude + child.magnitude * .99,
						this.baseMagnitude,
						this.baseMagnitude + this.magnitude,
						hueMin,
						hueMax
					);
				}
			}
			else
			{
				childHueMin = hueMin;
				childHueMax = hueMax;
			}
			
			if ( ! this.hideAlone && ! hide && ! this.hide && child.hide )
			{
				if ( hiddenStart == -1 )
				{
					hiddenStart = i;
				}
				
				if ( useHue() )
				{
					hiddenHueNumer += childHueMin * child.magnitude;
					hiddenHueDenom += child.magnitude;
				}
				else
				{
					hiddenHueNumer += childHueMin;
					hiddenHueDenom++;
				}
			}
			else
			{
				hiddenStart = -1;
				
				this.children[i].setTargetsSelected
				(
					childHueMin,
					childHueMax,
					lightness,
					hide || this.keyed || this.hideAlone || this.hide && ! collapse,
					false
				);
			}
			
			i++;
		}
		
	 	if ( this.hue && this.magnitude )
	 	{
		 	this.hue.setTarget(this.hues[currentDataset]);
			
			if ( this.attributes[magnitudeIndex][lastDataset] == 0 )
			{
				this.hue.start = this.hue.end;
			}
		}
	 	
		this.radialPrev = this.radial;
		
		if ( this == selectedNode )
		{
			this.resetLabelWidth();
			this.labelWidth.setTarget(this.nameWidth * labelWidthFudge);
			this.alphaWedge.setTarget(0);
			this.alphaLabel.setTarget(1);
			this.alphaOther.setTarget(1);
			this.alphaArc.setTarget(0);
			this.alphaLine.setTarget(0);
			this.alphaPattern.setTarget(0);
			this.r.setTarget(255);
			this.g.setTarget(255);
			this.b.setTarget(255);
			this.radial = false;
			this.labelRadius.setTarget(0);
		}
		else
		{
			var rgb = hslToRgb
			(
				hueMin,
				saturation,
				lightness
			);
			
			this.r.setTarget(rgb.r);
			this.g.setTarget(rgb.g);
			this.b.setTarget(rgb.b);
			this.alphaOther.setTarget(0);
			
			this.alphaWedge.setTarget(1);
			
			if ( this.hide || this.hideAlone )
			{
				this.alphaPattern.setTarget(1);
			}
			else
			{
				this.alphaPattern.setTarget(0);
			}
			
			// set radial
			//
			if ( ! ( hide || this.hide ) )//&& ! this.keyed )
			{
				if ( this.hideAlone )
				{
					this.radial = true;
				}
				else if ( false && canDisplayChildLabels )
				{
					this.radial = false;
				}
				else
				{
					this.radial = true;
					
					if ( this.hasChildren() && depth < maxDisplayDepth )
					{
						var lastChild = this.children[this.children.length - 1];
						
						if
						(
							lastChild.angleEnd.end == this.angleEnd.end ||
							(
								(this.angleStart.end + this.angleEnd.end) / 2 -
								lastChild.angleEnd.end
							) * (this.radiusInner.end + 1) * gRadius * 2 <
							minWidth()
						)
						{
							this.radial = false;
						}
					}
				}
			}
			
			// set alphaLabel
			//
			if
			(
				collapse ||
				hide ||
				this.hide ||
				this.keyed ||
				depth > maxDisplayDepth ||
				! this.canDisplayDepth()
			)
			{
				this.alphaLabel.setTarget(0);
			}
			else
			{
				if
				(
					(this.radial || nLabelOffsets[depth - 2])
				)
				{
					this.alphaLabel.setTarget(1);
				}
				else
				{
					this.alphaLabel.setTarget(0);
					
					if ( this.radialPrev )
					{
						this.alphaLabel.start = 0;
					}
				}
			}
			
			// set alphaArc
			//
			if
			(
				collapse ||
				hide ||
				depth > maxDisplayDepth ||
				! this.canDisplayDepth()
			)
			{
				this.alphaArc.setTarget(0);
			}
			else
			{
				this.alphaArc.setTarget(1);
			}
			
			// set alphaLine
			//
			if
			(
				hide ||
				this.hide && nextSiblingHidden ||
				depth > maxDisplayDepth ||
				! this.canDisplayDepth()
			)
			{
				this.alphaLine.setTarget(0);
			}
			else
			{
				this.alphaLine.setTarget(1);
			}
			
			//if (  ! this.radial )
			{
				this.resetLabelWidth();
			}
			
			// set labelRadius target
			//
			if ( collapse )
			{
				this.labelRadius.setTarget(this.radiusInner.end);
			}
			else
			{
				if ( depth > maxDisplayDepth || ! this.canDisplayDepth() )
				{
					this.labelRadius.setTarget(1);
				}
				else
				{
					this.setTargetLabelRadius();
				}
			}
		}
	}
	
	this.setTargetWedge = function()
	{
		var depth = this.getDepth() - selectedNode.getDepth() + 1;
		
		// set angles
		//
		var baseMagnitudeRelative = this.baseMagnitude - selectedNode.baseMagnitude;
		//
		this.angleStart.setTarget(baseMagnitudeRelative * angleFactor);
		this.angleEnd.setTarget((baseMagnitudeRelative + this.magnitude) * angleFactor);
		
		// set radiusInner
		//
		if ( depth > maxDisplayDepth || ! this.canDisplayDepth() )
		{
			this.radiusInner.setTarget(1);
		}
		else
		{
			if ( compress )
			{
				this.radiusInner.setTarget(compressedRadii[depth - 2]);
			}
			else
			{
				this.radiusInner.setTarget(nodeRadius * (depth - 1));
			}
		}
		
		if ( this.hide != undefined )
		{
			this.hidePrev = this.hide;
		}
		
		if ( this.hideAlone != undefined )
		{
			this.hideAlonePrev = this.hideAlone;
		}
		
		// set hide
		//
		if
		(
			(this.angleEnd.end - this.angleStart.end) *
			(this.radiusInner.end * gRadius + gRadius) <
			minWidth()
		)
		{
			if ( depth == 2 && ! this.getCollapse() && this.depth <= maxAbsoluteDepth )
			{
				this.keyed = true;
				keys++;
				this.hide = false;
				
				var percentage = this.getPercentage();
				this.keyLabel = this.name + '   ' + percentage + '%';
				var dim = context.measureText(this.keyLabel);
				this.keyNameWidth = dim.width;
			}
			else
			{
				this.keyed = false;
				this.hide = depth > 2;
			}
		}
		else
		{
			this.keyed = false;
			this.hide = false;
		}
	}
	
	this.shortenLabel = function()
	{
		var label = this.name;
		
		var labelWidth = this.nameWidth;
		var maxWidth = this.labelWidth.current();
		var minEndLength = 0;
		
		if ( labelWidth > maxWidth && label.length > minEndLength * 2 )
		{
			var endLength =
				Math.floor((label.length - 1) * maxWidth / labelWidth / 2);
			
			if ( endLength < minEndLength )
			{
				endLength = minEndLength;
			}
			
			return (
				label.substring(0, endLength) +
				'...' +
				label.substring(label.length - endLength));
		}
		else
		{
			return label;
		}
	}
	
/*	this.shouldAddSearchResultsString = function()
	{
		if ( this.isSearchResult )
		{
			return this.searchResults > 1;
		}
		else
		{
			return this.searchResults > 0;
		}
	}
*/	
	this.sort = function()
	{
		this.children.sort(function(a, b){return b.getMagnitude() - a.getMagnitude()});
		
		for (var i = 0; i < this.children.length; i++)
		{
			this.children[i].sort();
		}
	}
}

var options;

function addOptionElement(position, innerHTML, title)
{
	var div = document.createElement("div");
//	div.style.position = 'absolute';
//	div.style.top = position + 'px';
	div.innerHTML = innerHTML;
//	div.style.display = 'block';
	div.style.padding = '2px';
	
	if ( title )
	{
		div.title = title;
	}
	
	options.appendChild(div);
	var height = 0;//div.clientHeight;
	return position + height;
}

function addOptionElements(hueName, hueDefault)
{
	options = document.createElement('div');
	options.style.position = 'absolute';
	options.style.top = '0px';
	options.addEventListener('mousedown', function(e) {mouseClick(e)}, false);
//	options.onmouseup = function(e) {mouseUp(e)}
	document.body.appendChild(options);
	
	document.body.style.font = '11px sans-serif';
	var position = 5;
	
	details = document.createElement('div');
	details.style.position = 'absolute';
	details.style.top = '1%';
	details.style.right = '2%';
	details.style.textAlign = 'right';
	document.body.insertBefore(details, canvas);
//		<div id="details" style="position:absolute;top:1%;right:2%;text-align:right;">

	details.innerHTML = '\
<span id="detailsName" style="font-weight:bold"></span>&nbsp;\
<input type="button" id="detailsExpand" onclick="expand(focusNode);"\
value="&harr;" title="Expand this wedge to become the new focus of the chart"/><br/>\
<div id="detailsInfo" style="float:right"></div>';

	keyControl = document.createElement('input');
	keyControl.type = 'button';
	keyControl.value = showKeys ? 'x' : '…';
	keyControl.style.position = '';
	keyControl.style.position = 'fixed';
	keyControl.style.visibility = 'hidden';
	
	document.body.insertBefore(keyControl, canvas);
	
	var logoElement = document.getElementById('logo');
	
	if ( logoElement )
	{
		logoImage = logoElement.src;
	}
	else
	{
		logoImage = 'http://marbl.github.io/Krona/img/logo-med.png';
	}
	
//	document.getElementById('options').style.fontSize = '9pt';
	position = addOptionElement
	(
		position,
'<a style="margin:2px" target="_blank" href="https://github.com/marbl/Krona/wiki"><img style="vertical-align:middle;width:108px;height:30px;" src="' + logoImage + '" alt="Logo of Krona"/></a><input type="button" id="back" value="&larr;" title="Go back (Shortcut: &larr;)"/>\
<input type="button" id="forward" value="&rarr;" title="Go forward (Shortcut: &rarr;)"/> \
&nbsp;Search: <input type="text" id="search"/>\
<input id="searchClear" type="button" value="x" onclick="clearSearch()"/> \
<span id="searchResults"></span>'
	);
	
	if ( datasets > 1 )
	{
		var size = datasets < datasetSelectSize ? datasets : datasetSelectSize;
		
		var select =
			'<table style="border-collapse:collapse;padding:0px"><tr><td style="padding:0px">' +
			'<select id="datasets" style="min-width:100px" size="' + size + '" onchange="onDatasetChange()">';
		
		for ( var i = 0; i < datasetNames.length; i++ )
		{
			select += '<option>' + datasetNames[i] + '</option>';
		}
		
		select +=
			'</select></td><td style="vertical-align:top;padding:1px;">' +
			'<input style="display:block" title="Previous dataset (Shortcut: &uarr;)" id="prevDataset" type="button" value="&uarr;" onclick="prevDataset()" disabled="true"/>' +
			'<input title="Next dataset (Shortcut: &darr;)" id="nextDataset" type="button" value="&darr;" onclick="nextDataset()"/><br/></td>' +
			'<td style="padding-top:1px;vertical-align:top"><input title="Switch to the last dataset that was viewed (Shortcut: TAB)" id="lastDataset" type="button" style="font:11px Times new roman" value="last" onclick="selectLastDataset()"/></td></tr></table>';
		
		position = addOptionElement(position + 5, select);
		
		datasetDropDown = document.getElementById('datasets');
		datasetButtonLast = document.getElementById('lastDataset');
		datasetButtonPrev = document.getElementById('prevDataset');
		datasetButtonNext = document.getElementById('nextDataset');
		
		position += datasetDropDown.clientHeight;
	}
	
	position = addOptionElement
	(
		position + 5,
'<input type="button" id="maxAbsoluteDepthDecrease" value="-"/>\
<span id="maxAbsoluteDepth"></span>\
&nbsp;<input type="button" id="maxAbsoluteDepthIncrease" value="+"/> Max depth',
'Maximum depth to display, counted from the top level \
and including collapsed wedges.'
	);
	
	position = addOptionElement
	(
		position,
'<input type="button" id="fontSizeDecrease" value="-"/>\
<span id="fontSize"></span>\
&nbsp;<input type="button" id="fontSizeIncrease" value="+"/> Font size'
	);
	
	position = addOptionElement
	(
		position,
'<input type="button" id="radiusDecrease" value="-"/>\
<input type="button" id="radiusIncrease" value="+"/> Chart size'
	);
	
	if ( hueName )
	{
		hueDisplayName = attributes[attributeIndex(hueName)].displayName;
		
		position = addOptionElement
		(
			position + 5,
			'<input type="checkbox" id="useHue" style="float:left" ' +
			'/><div>Color by<br/>' + hueDisplayName +
			'</div>'
		);
		
		useHueCheckBox = document.getElementById('useHue');
		useHueCheckBox.checked = hueDefault;
		useHueCheckBox.onclick = handleResize;
		useHueCheckBox.onmousedown = suppressEvent;
	}
	/*
	position = addOptionElement
	(
		position + 5,
		'&nbsp;<input type="checkbox" id="shorten" checked="checked" />Shorten labels</div>',
		'Prevent labels from overlapping by shortening them'
	);
	
	position = addOptionElement
	(
		position,
		'&nbsp;<input type="checkbox" id="compress" checked="checked" />Compress',
		'Compress wedges if needed to show the entire depth'
	);
	*/
	position = addOptionElement
	(
		position,
		'<input type="checkbox" id="showMagnitude" checked="checked" />Show magnitudes',
		'Show magnitudes in labels'
	);
	
	position = addOptionElement
	(
		position,
		'<input type="checkbox" id="collapse" checked="checked" />Collapse',
		'Collapse wedges that are redundant (entirely composed of another wedge)'
	);
	
	position = addOptionElement
	(
		position + 5,
		'<input type="button" id="snapshot" value="Snapshot"/>',
'Render the current view as SVG (Scalable Vector Graphics), a publication-\
quality format that can be printed and saved (see Help for browser compatibility)'
	);
	
	position = addOptionElement
	(
		position + 5,
'<input type="button" id="linkButton" value="Link"/>\
<input type="text" size="30" id="linkText"/>',
'Show a link to this view that can be copied for bookmarking or sharing'
	);
	
	position = addOptionElement
	(
		position + 5,
'<input type="button" id="help" value="?"\
onclick="window.open(\'https://github.com/marbl/Krona/wiki/Browsing%20Krona%20charts\', \'help\')"/>',
'Help'
	);

    position = addOptionElement(
        position + 5,
        '<input type="button" id="style-btn" value="Style"/>',
        'Open style pannel'
    );
}

function arrow(angleStart, angleEnd, radiusInner)
{
	if ( context.globalAlpha == 0 )
	{
		return;
	}
	
	var angleCenter = (angleStart + angleEnd) / 2;
	var radiusArrowInner = radiusInner - gRadius / 10;//nodeRadius * gRadius;
	var radiusArrowOuter = gRadius * 1.1;//(1 + nodeRadius);
	var radiusArrowCenter = (radiusArrowInner + radiusArrowOuter) / 2;
	var pointLength = (radiusArrowOuter - radiusArrowInner) / 5;
	
	context.fillStyle = highlightFill;
	context.lineWidth = highlightLineWidth;
	
	// First, mask out the first half of the arrow.  This will prevent the tips
	// from superimposing if the arrow goes most of the way around the circle.
	// Masking is done by setting the clipping region to the inverse of the
	// half-arrow, which is defined by cutting the half-arrow out of a large
	// rectangle
	//
	context.beginPath();
	context.arc(0, 0, radiusInner, angleCenter, angleEnd, false);
	context.lineTo
	(
		radiusArrowInner * Math.cos(angleEnd),
		radiusArrowInner * Math.sin(angleEnd)
	);
	context.lineTo
	(
		radiusArrowCenter * Math.cos(angleEnd) - pointLength * Math.sin(angleEnd),
		radiusArrowCenter * Math.sin(angleEnd) + pointLength * Math.cos(angleEnd)
	);
	context.lineTo
	(
		radiusArrowOuter * Math.cos(angleEnd),
		radiusArrowOuter * Math.sin(angleEnd)
	);
	context.arc(0, 0, gRadius, angleEnd, angleCenter, true);
	context.closePath();
	context.moveTo(-imageWidth, -imageHeight);
	context.lineTo(imageWidth, -imageHeight);
	context.lineTo(imageWidth, imageHeight);
	context.lineTo(-imageWidth, imageHeight);
	context.closePath();
	context.save();
	context.clip();
	
	// Next, draw the other half-arrow with the first half masked out
	//
	context.beginPath();
	context.arc(0, 0, radiusInner, angleCenter, angleStart, true);
	context.lineTo
	(
		radiusArrowInner * Math.cos(angleStart),
		radiusArrowInner * Math.sin(angleStart)
	);
	context.lineTo
	(
		radiusArrowCenter * Math.cos(angleStart) + pointLength * Math.sin(angleStart),
		radiusArrowCenter * Math.sin(angleStart) - pointLength * Math.cos(angleStart)
	);
	context.lineTo
	(
		radiusArrowOuter * Math.cos(angleStart),
		radiusArrowOuter * Math.sin(angleStart)
	);
	context.arc(0, 0, gRadius, angleStart, angleCenter, false);
	context.fill();
	context.stroke();
	
	// Finally, remove the clipping region and draw the first half-arrow.  This
	// half is extended slightly to fill the seam.
	//
	context.restore();
	context.beginPath();
	context.arc(0, 0, radiusInner, angleCenter - 2 / (2 * Math.PI * radiusInner), angleEnd, false);
	context.lineTo
	(
		radiusArrowInner * Math.cos(angleEnd),
		radiusArrowInner * Math.sin(angleEnd)
	);
	context.lineTo
	(
		radiusArrowCenter * Math.cos(angleEnd) - pointLength * Math.sin(angleEnd),
		radiusArrowCenter * Math.sin(angleEnd) + pointLength * Math.cos(angleEnd)
	);
	context.lineTo
	(
		radiusArrowOuter * Math.cos(angleEnd),
		radiusArrowOuter * Math.sin(angleEnd)
	);
	context.arc(0, 0, gRadius, angleEnd, angleCenter - 2 / (2 * Math.PI * gRadius), true);
	context.fill();
	context.stroke();
}

function attributeIndex(aname)
{
	for ( var i = 0 ; i < attributes.length; i++ )
	{
		if ( aname == attributes[i].name )
		{
			return i;
		}
	}
	
	return null;
}

function checkHighlight()
{
	var lastHighlightedNode = highlightedNode;
	var lastHighlightingHidden = highlightingHidden;
	
	highlightedNode = selectedNode;
	resetKeyOffset();
	
	if ( progress == 1 )
	{
		selectedNode.checkHighlight();
		if ( selectedNode.getParent() )
		{
			selectedNode.getParent().checkHighlightCenter();
		}
		
		focusNode.checkHighlightMap();
	}
	
	if ( highlightedNode != selectedNode )
	{
		if ( highlightedNode == focusNode )
		{
//			canvas.style.display='none';
//			window.resizeBy(1,0);
//			canvas.style.cursor='ew-resize';
//			window.resizeBy(-1,0);
//			canvas.style.display='inline';
		}
		else
		{
//			canvas.style.cursor='pointer';
		}
	}
	else
	{
//		canvas.style.cursor='auto';
	}
	
	if
	(
		(
			true ||
			highlightedNode != lastHighlightedNode ||
			highlightingHidden != highlightingHiddenLast
		) &&
		progress == 1
	)
	{
		draw(); // TODO: handle in update()
	}
}

function checkSelectedCollapse()
{
	var newNode = selectedNode;
	
	while ( newNode.getCollapse() )
	{
		newNode = newNode.children[0];
	}
	
	if ( newNode.children.length == 0 && newNode.getParent() )
	{
		newNode = newNode.getParent();
	}
	
	if ( newNode != selectedNode )
	{
		selectNode(newNode);
	}
}

function clearSearch()
{
	if ( search.value != '' )
	{
		search.value = '';
		onSearchChange();
	}
}

function createSVG()
{
	svgNS = "http://www.w3.org/2000/svg";
	var SVG = {};
	SVG.xlinkns = "http://www.w3.org/1999/xlink";
	
	var newSVG = document.createElementNS(svgNS, "svg:svg");
	
	newSVG.setAttribute("id", "canvas");
	// How big is the canvas in pixels
	newSVG.setAttribute("width", '100%');
	newSVG.setAttribute("height", '100%');
	// Set the coordinates used by drawings in the canvas
//	newSVG.setAttribute("viewBox", "0 0 " + imageWidth + " " + imageHeight);
	// Define the XLink namespace that SVG uses
	newSVG.setAttributeNS
	(
		"http://www.w3.org/2000/xmlns/",
		"xmlns:xlink",
		SVG.xlinkns
	);
	
	return newSVG;
}

function degrees(radians)
{
	return radians * 180 / Math.PI;
}

function draw()
{
	tweenFrames++;
	//resize();
//	context.fillRect(0, 0, imageWidth, imageHeight);
	context.clearRect(0, 0, imageWidth, imageHeight);
	
	context.font = fontNormal;
	context.textBaseline = 'middle';
	
	//context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
	context.translate(centerX, centerY);
	
	resetKeyOffset();
	
	head.draw(false, false); // draw pie slices
	head.draw(true, false); // draw labels
	
	var pathRoot = selectedNode;
	
	if ( focusNode != 0 && focusNode != selectedNode )
	{
		context.globalAlpha = 1;
		focusNode.drawHighlight(true);
		pathRoot = focusNode;
	}
	
	if
	(
		highlightedNode &&
		highlightedNode.getDepth() >= selectedNode.getDepth() &&
		highlightedNode != focusNode
	)
	{
		if
		(
			progress == 1 &&
			highlightedNode != selectedNode &&
			(
				highlightedNode != focusNode ||
				focusNode.children.length > 0
			)
		)
		{
			context.globalAlpha = 1;
			highlightedNode.drawHighlight(true);
		}
		
		//pathRoot = highlightedNode;
	}
	else if
	(
		progress == 1 &&
		highlightedNode.getDepth() < selectedNode.getDepth()
	)
	{
		context.globalAlpha = 1;
		highlightedNode.drawHighlightCenter();
	}
	
	if ( quickLook && false) // TEMP
	{
		context.globalAlpha = 1 - progress / 2;
		selectedNode.drawHighlight(true);
	}
	else if ( progress < 1 )//&& zoomOut() )
	{
		if ( !zoomOut)//() )
		{
			context.globalAlpha = selectedNode.alphaLine.current();
			selectedNode.drawHighlight(true);
		}
		else if ( selectedNodeLast )
		{
			context.globalAlpha = 1 - 4 * Math.pow(progress - .5, 2);
			selectedNodeLast.drawHighlight(false);
		}
	}
	
	drawDatasetName();
	
	//drawHistory();
	
	context.translate(-centerX, -centerY);
	context.globalAlpha = 1;
	
	mapRadius =
		(imageHeight / 2 - details.clientHeight - details.offsetTop) /
		(pathRoot.getDepth() - 1) * 3 / 4 / 2;
	
	if ( mapRadius > maxMapRadius )
	{
		mapRadius = maxMapRadius;
	}
	
	mapBuffer = mapRadius / 2;
	
	//context.font = fontNormal;
	pathRoot.drawMap(pathRoot);
	
	if ( hueDisplayName && useHue() )
	{
		drawLegend();
	}
}

function drawBubble(angle, radius, width, radial, flip)
{
	var height = fontSize * 2;
	var x;
	var y;
	
	width = width + fontSize;
	
	if ( radial )
	{
		y = -fontSize;
		
		if ( flip )
		{
			x = radius - width + fontSize / 2;
		}
		else
		{
			x = radius - fontSize / 2;
		}
	}
	else
	{
		x = -width / 2;
		y = -radius - fontSize;
	}
	
	if ( snapshotMode )
	{
		drawBubbleSVG(x + centerX, y + centerY, width, height, fontSize, angle);
	}
	else
	{
		drawBubbleCanvas(x, y, width, height, fontSize, angle);
	}
}

function drawBubbleCanvas(x, y, width, height, radius, rotation)
{
	context.strokeStyle = 'black';
	context.lineWidth = highlightLineWidth;
	context.fillStyle = 'rgba(255, 255, 255, .75)';
	context.rotate(rotation);
	roundedRectangle(x, y, width, fontSize * 2, fontSize);
	context.fill();
	context.stroke();
	context.rotate(-rotation);
}

function drawBubbleSVG(x, y, width, height, radius, rotation)
{
	svg +=
		'<rect x="' + x + '" y="' + y +
		'" width="' + width +
		'" height="' + height +
		'" rx="' + radius +
		'" ry="' + radius +
		'" fill="rgba(255, 255, 255, .75)' +
		'" class="highlight" ' +
		'transform="rotate(' +
		degrees(rotation) + ',' + centerX + ',' + centerY +
		')"/>';
}

function drawDatasetName()
{
	var alpha = datasetAlpha.current();
	
	if ( alpha > 0 )
	{
		var radius = gRadius * compressedRadii[0] / -2;
		
		if ( alpha > 1 )
		{
			alpha = 1;
		}
		
		context.globalAlpha = alpha;
		
		drawBubble(0, -radius, datasetWidths[currentDataset], false, false);
		drawText(datasetNames[currentDataset], 0, radius, 0, 'center', true);
	}
}

function drawHistory()
{
	var alpha = 1;
	context.textAlign = 'center';
	
	for ( var i = 0; i < nodeHistoryPosition && alpha > 0; i++ )
	{
		
		context.globalAlpha = alpha - historyAlphaDelta * tweenFactor;
		context.fillText
		(
			nodeHistory[nodeHistoryPosition - i - 1].name,
			0,
			(i + tweenFactor) * historySpacingFactor * fontSize - 1
		);
		
		if ( alpha > 0 )
		{
			alpha -= historyAlphaDelta;
		}
	}
	
	context.globalAlpha = 1;
}

function drawLegend()
{
	var left = imageWidth * .01;
	var width = imageHeight * .0265;
	var height = imageHeight * .15;
	var top = imageHeight - fontSize * 3.5 - height;
	var textLeft = left + width + fontSize / 2;
	
	context.fillStyle = 'black';
	context.textAlign = 'start';
	context.font = fontNormal;
//	context.fillText(valueStartText, textLeft, top + height);
//	context.fillText(valueEndText, textLeft, top);
	context.fillText(hueDisplayName, left, imageHeight - fontSize * 1.5);
	
	var gradient = context.createLinearGradient(0, top + height, 0, top);
	
	for ( var i = 0; i < hueStopPositions.length; i++ )
	{
		gradient.addColorStop(hueStopPositions[i], hueStopHsl[i]);
		
		var textY = top + (1 - hueStopPositions[i]) * height;
		
		if
		(
			i == 0 ||
			i == hueStopPositions.length - 1 ||
			textY > top + fontSize && textY < top + height - fontSize
		)
		{
			context.fillText(hueStopText[i], textLeft, textY);
		}
	}
	
	context.fillStyle = gradient;
	context.fillRect(left, top, width, height);
	context.lineWidth = thinLineWidth;
	context.strokeRect(left, top, width, height);
}

function drawLegendSVG()
{
	var left = imageWidth * .01;
	var width = imageHeight * .0265;
	var height = imageHeight * .15;
	var top = imageHeight - fontSize * 3.5 - height;
	var textLeft = left + width + fontSize / 2;

	var text = '';
	
	text += svgText(hueDisplayName, left, imageHeight - fontSize * 1.5);
	
	var svgtest = '<linearGradient id="gradient" x1="0%" y1="100%" x2="0%" y2="0%">';
	
	for ( var i = 0; i < hueStopPositions.length; i++ )
	{
		svgtest +=
			'<stop offset="' + round(hueStopPositions[i] * 100) +
			'%" style="stop-color:' + hueStopHsl[i] + '"/>';
		
		var textY = top + (1 - hueStopPositions[i]) * height;
		
		if
		(
			i == 0 ||
			i == hueStopPositions.length - 1 ||
			textY > top + fontSize && textY < top + height - fontSize
		)
		{
			text += svgText(hueStopText[i], textLeft, textY);
		}
	}
	
	svgtest += '</linearGradient>';
	//alert(svgtest);
	svg += svgtest;
	svg +=
		'<rect style="fill:url(#gradient)" x="' + left + '" y="' + top +
		'" width="' + width + '" height="' + height + '"/>';
	
	svg += text;
}

function drawSearchHighlights(label, bubbleX, bubbleY, rotation, center)
{
	var index = -1;
	var labelLength = label.length;
	
	bubbleX -= fontSize / 4;
	
	do
	{
		index = label.toLowerCase().indexOf(search.value.toLowerCase(), index + 1);
		
		if ( index != -1 && index < labelLength )
		{
			var dim = context.measureText(label.substr(0, index));
			var x = bubbleX + dim.width;
			
			dim = context.measureText(label.substr(index, search.value.length));
			
			var y = bubbleY - fontSize * 3 / 4;
			var width = dim.width + fontSize / 2;
			var height = fontSize * 3 / 2;
			var radius = fontSize / 2;
			
			if ( snapshotMode )
			{
				if ( center )
				{
					x += centerX;
					y += centerY;
				}
				
				svg +=
					'<rect x="' + x + '" y="' + y +
					'" width="' + width +
					'" height="' + height +
					'" rx="' + radius +
					'" ry="' + radius +
					'" class="searchHighlight' +
					'" transform="rotate(' +
					degrees(rotation) + ',' + centerX + ',' + centerY +
					')"/>';
			}
			else
			{
				context.fillStyle = 'rgb(255, 255, 100)';
				context.rotate(rotation);
				roundedRectangle(x, y, width, height, radius);
				context.fill();
				context.rotate(-rotation);
			}
		}
	}
	while ( index != -1 && index < labelLength );
}

function drawText(text, x, y, angle, anchor, bold, color)
{
	if ( color == undefined )
	{
		color = 'black';
	}
	
	if ( snapshotMode )
	{
		svg +=
			'<text x="' + (centerX + x) + '" y="' + (centerY + y) +
			'" text-anchor="' + anchor + '" style="font-color:' + color + ';font-weight:' + (bold ? 'bold' : 'normal') +
			'" transform="rotate(' + degrees(angle) + ',' + centerX + ',' + centerY + ')">' +
			text + '</text>';
	}
	else
	{
		context.fillStyle = color;
		context.textAlign = anchor;
		context.font = bold ? fontBold : fontNormal;
		context.rotate(angle);
		context.fillText(text, x, y);
		context.rotate(-angle);
	}
}

function drawTextPolar
(
	text,
	innerText,
	angle,
	radius,
	radial,
	bubble,
	bold, 
	searchResult,
	searchResults
)
{
	var anchor;
	var textX;
	var textY;
	var spacer;
	var totalText = text;
	var flip;
	
	if ( snapshotMode )
	{
		spacer = '&#160;&#160;&#160;';
	}
	else
	{
		spacer = '   ';
	}
	
	if ( radial )
	{
		flip = angle < 3 * Math.PI / 2;
		
		if ( flip )
		{
			angle -= Math.PI;
			radius = -radius;
			anchor = 'end';
			
			if ( innerText )
			{
				totalText = text + spacer + innerText;
			}
		}
		else
		{
			anchor = 'start';
			
			if ( innerText )
			{
				totalText = innerText + spacer + text;
			}
		}
		
		textX = radius;
		textY = 0;
	}
	else
	{
		flip = angle < Math.PI || angle > 2 * Math.PI;
		var label;
		
		anchor = snapshotMode ? 'middle' : 'center';
		
		if ( flip )
		{
			angle -= Math.PI;
			radius = -radius;
		}
		
		angle += Math.PI / 2;
		textX = 0;
		textY = -radius;
	}
	
	if ( bubble )
	{
		var textActual = totalText;
		
		if ( innerText && snapshotMode )
		{
			if ( flip )
			{
				textActual = text + '   ' + innerText;
			}
			else
			{
				textActual = innerText + '   ' + text;
			}
		}
		
		if ( searchResults )
		{
			textActual = textActual + searchResultString(searchResults);
		}
		
		var textWidth = measureText(textActual, bold);
		
		var x = textX;
		
		if ( anchor == 'end' )
		{
			x -= textWidth;
		}
		else if ( anchor != 'start' )
		{
			// centered
			x -= textWidth / 2;
		}
		
		drawBubble(angle, radius, textWidth, radial, flip);
		
		if ( searchResult )
		{
			drawSearchHighlights
			(
				textActual,
				x,
				textY,
				angle,
				true
			)
		}
	}
	
	if ( searchResults )
	{
		totalText = totalText + searchResultString(searchResults);
	}
	
	drawText(totalText, textX, textY, angle, anchor, bold);
	
	return flip;
}

function drawTick(start, length, angle)
{
	if ( snapshotMode )
	{
		svg +=
			'<line x1="' + (centerX + start) +
			'" y1="' + centerY +
			'" x2="' + (centerX + start + length) +
			'" y2="' + centerY +
			'" class="tick" transform="rotate(' +
			degrees(angle) + ',' + centerX + ',' + centerY +
			')"/>';
	}
	else
	{
		context.rotate(angle);
		context.beginPath();
		context.moveTo(start, 0);
		context.lineTo(start + length, 0);
		context.lineWidth = thinLineWidth * 2;
		context.stroke();
		context.rotate(-angle);
	}
}

function drawWedge(
  angleStart, angleEnd,
  radiusInner, radiusOuter,
  color,      // couleur passée par Krona (multicolor)
  patternAlpha,
  highlight
) {
  if (context.globalAlpha === 0) return;

  if (snapshotMode) {
    // ——————— NE PAS TOUCHER ———————
    if (angleEnd === angleStart + Math.PI * 2) {
      angleEnd -= .1 / gRadius;
    }
    const longArc = (angleEnd - angleStart) > Math.PI ? 1 : 0;

    const x1 = centerX + radiusInner * Math.cos(angleStart);
    const y1 = centerY + radiusInner * Math.sin(angleStart);
    const x2 = centerX + gRadius * Math.cos(angleStart);
    const y2 = centerY + gRadius * Math.sin(angleStart);
    const x3 = centerX + gRadius * Math.cos(angleEnd);
    const y3 = centerY + gRadius * Math.sin(angleEnd);
    const x4 = centerX + radiusInner * Math.cos(angleEnd);
    const y4 = centerY + radiusInner * Math.sin(angleEnd);

    const dArray = [
      " M ", x1, ",", y1,
      " L ", x2, ",", y2,
      " A ", gRadius, ",", gRadius, " 0 ", longArc, ",1 ", x3, ",", y3,
      " L ", x4, ",", y4,
      " A ", radiusInner, ",", radiusInner, " 0 ", longArc, " 0 ", x1, ",", y1,
      " Z "
    ];

    svg +=
      '<path class="' + (highlight ? 'highlight' : 'wedge') + 
      '" fill="' + color +
      '" d="' + dArray.join('') + '"/>';
    if (patternAlpha > 0) {
      svg +=
        '<path class="wedge" fill="url(#hiddenPattern)" d="' +
        dArray.join('') + '"/>';
    }
    // ——————————————————————————————
  }
  else {
    // évite les micro-seams
    angleEnd += 1 / gRadius;

    // ——————— RENDU CANVAS ———————
    let fillColor;
    if (overrideHSL) {
      // Mode “Uniforme” : couleur choisie, nuancée selon la part d’arc
      const pct    = (angleEnd - angleStart) / (2 * Math.PI);
      const effPct = invertPalette ? 1 - pct : pct;
      const L      = 30 + effPct * 50;
      fillColor     = `hsl(${overrideHSL.h},${overrideHSL.s}%,${L}%)`;
    }
    else {
      // Mode “Multicolor” ou rien choisi : couleur d’origine, on ignore invertPalette
      fillColor = color;
    }
    context.fillStyle = fillColor;

    context.beginPath();
    context.arc(0, 0, radiusInner, angleStart, angleEnd, false);
    context.arc(0, 0, radiusOuter, angleEnd, angleStart, true);
    context.closePath();
    context.fill();

    if (patternAlpha > 0) {
      context.save();
      context.clip();
      context.globalAlpha = patternAlpha;
      context.fillStyle = hiddenPattern;
      context.fill();
      context.restore();
    }

    if (highlight) {
      context.lineWidth   = highlightLineWidth;
      context.strokeStyle = 'black';
      context.stroke();
    }
    // ——————————————————————————————
  }
}


function expand(node)
{
	selectNode(node);
	updateView();
}

function focusLost()
{
	mouseX = -1;
	mouseY = -1;
	checkHighlight();
	document.body.style.cursor = 'auto';
}

function fontSizeDecrease()
{
	if ( fontSize > 1 )
	{
		fontSize--;
		updateViewNeeded = true;
	}
}

function fontSizeIncrease()
{
	fontSize++;
	updateViewNeeded = true;
}

function getGetString(name, value, bool)
{
	return name + '=' + (bool ? value ? 'true' : 'false' : value);
}

function hideLink()
{
	hide(linkText);
	show(linkButton);
}

function show(object)
{
	object.style.display = 'inline';
}

function hide(object)
{
	object.style.display = 'none';
}

function showLink()
{
	var urlHalves = String(document.location).split('?');
	var newGetVariables = new Array();
	
	newGetVariables.push
	(
		getGetString('dataset', currentDataset, false),
		getGetString('node', selectedNode.id, false),
		getGetString('collapse', collapse, true),
		getGetString('showMagnitude', showMagnitude, true),
		getGetString('color', useHue(), true),
		getGetString('depth', maxAbsoluteDepth - 1, false),
		getGetString('font', fontSize, false),
		getGetString('key', showKeys, true)
	);
	
	hide(linkButton);
	show(linkText);
	linkText.value = urlHalves[0] + '?' + getVariables.concat(newGetVariables).join('&');
	//linkText.disabled = false;
	linkText.focus();
	linkText.select();
	//linkText.disabled = true;
//	document.location = urlHalves[0] + '?' + getVariables.join('&');
}

function getFirstChild(element)
{
	element = element.firstChild;
	
	if ( element && element.nodeType != 1 )
	{
		element = getNextSibling(element);
	}
	
	return element;
}

function getNextSibling(element)
{
	do
	{
		element = element.nextSibling;
	}
	while ( element && element.nodeType != 1 );
	
	return element;
}

function getPercentage(fraction)
{
	return round(fraction * 100);
}

function hslText(hue)
{
	if ( 1 || snapshotMode )
	{
		// Safari doesn't seem to allow hsl() in SVG
		
		var rgb = hslToRgb(hue, saturation, (lightnessBase + lightnessMax) / 2);
		
		return rgbText(rgb.r, rgb.g, rgb.b);
	}
	else
	{
		var hslArray =
		[
			'hsl(',
			Math.floor(hue * 360),
			',',
			Math.floor(saturation * 100),
			'%,',
			Math.floor((lightnessBase + lightnessMax) * 50),
			'%)'
		];
		
		return hslArray.join('');
	}
}

function hslToRgb(h, s, l)
{
	var m1, m2;
	var r, g, b;
	
	if (s == 0)
	{
		r = g = b = Math.floor((l * 255));
	}
	else
	{
		if (l <= 0.5)
		{
			m2 = l * (s + 1);
		}
		else
		{
			m2 = l + s - l * s;
		}
		
		m1 = l * 2 - m2;
		
		r = Math.floor(hueToRgb(m1, m2, h + 1 / 3));
		g = Math.floor(hueToRgb(m1, m2, h));
		b = Math.floor(hueToRgb(m1, m2, h - 1/3));
	}
	
	return {r: r, g: g, b: b};
}

function hueToRgb(m1, m2, hue)
{
	var v;
	
	while (hue < 0)
	{
		hue += 1;
	}
	
	while (hue > 1)
	{
		hue -= 1;
	}
	
	if (6 * hue < 1)
		v = m1 + (m2 - m1) * hue * 6;
	else if (2 * hue < 1)
		v = m2;
	else if (3 * hue < 2)
		v = m1 + (m2 - m1) * (2/3 - hue) * 6;
	else
		v = m1;

	return 255 * v;
}

function interpolateHue(hueStart, hueEnd, valueStart, valueEnd)
{
	// since the gradient will be RGB based, we need to add stops to hit all the
	// colors in the hue spectrum
	
	hueStopPositions = new Array();
	hueStopHsl = new Array();
	hueStopText = new Array();
	
	hueStopPositions.push(0);
	hueStopHsl.push(hslText(hueStart));
	hueStopText.push(round(valueStart));
	
	for
	(
		var i = (hueStart > hueEnd ? 5 / 6 : 1 / 6);
		(hueStart > hueEnd ? i > 0 : i < 1);
		i += (hueStart > hueEnd ? -1 : 1) / 6
	)
	{
		if
		(
			hueStart > hueEnd ?
				i > hueEnd && i < hueStart :
				i > hueStart && i < hueEnd
		)
		{
			hueStopPositions.push(lerp(i, hueStart, hueEnd, 0, 1));
			hueStopHsl.push(hslText(i));
			hueStopText.push(round(lerp
			(
				i,
				hueStart,
				hueEnd,
				valueStart,
				valueEnd
			)));
		}
	}
	
	hueStopPositions.push(1);
	hueStopHsl.push(hslText(hueEnd));
	hueStopText.push(round(valueEnd));
}

function keyLineAngle(angle, keyAngle, bendRadius, keyX, keyY, pointsX, pointsY)
{
	if ( angle < Math.PI / 2 && keyY < bendRadius * Math.sin(angle) 
	|| angle > Math.PI / 2 && keyY < bendRadius)
	{
		return Math.asin(keyY / bendRadius);
	}
	else
	{
		// find the angle of the normal to a tangent line that goes to
		// the label
		
		var textDist = Math.sqrt
		(
			Math.pow(keyX, 2) +
			Math.pow(keyY, 2)
		);
		
		var tanAngle = Math.acos(bendRadius / textDist) + keyAngle;
		
		if ( angle < tanAngle || angle < Math.PI / 2 )//|| labelLeft < centerX )
		{
			// angle doesn't reach far enough for tangent; collapse and
			// connect directly to label
			
			if ( keyY / Math.tan(angle) > 0 )
			{
				pointsX.push(keyY / Math.tan(angle));
				pointsY.push(keyY);
			}
			else
			{
				pointsX.push(bendRadius * Math.cos(angle));
				pointsY.push(bendRadius * Math.sin(angle));
			}
			
			return angle;
		}
		else
		{
			return tanAngle;
		}
	}
}

function keyOffset()
{
	return imageHeight - (keys - currentKey + 1) * (keySize + keyBuffer) + keyBuffer - margin;
}

function lerp(value, fromStart, fromEnd, toStart, toEnd)
{
	return (value - fromStart) *
		(toEnd - toStart) /
		(fromEnd - fromStart) +
		toStart;
}

function createCanvas()
{
	canvas = document.createElement('canvas');
	document.body.appendChild(canvas);
	context = canvas.getContext('2d');
}

function load()
{
	document.body.style.overflow = "hidden";
	document.body.style.margin = 0;
	
	createCanvas();
	
	if ( context == undefined )
	{
		document.body.innerHTML = '\
<br/>This browser does not support HTML5 (see \
<a href="https://github.com/marbl/Krona/wiki/Browser%20support">Browser support</a>).\
	';
		return;
	}

	if ( typeof context.fillText != 'function' )
	{
		document.body.innerHTML = '\
<br/>This browser does not support HTML5 canvas text (see \
<a href="https://github.com/marbl/Krona/wiki/Browser%20support">Browser support</a>).\
	';
		return;
	}
	
	resize();
	
	var kronaElement = document.getElementsByTagName('krona')[0];
	
	var magnitudeName;
	var hueName;
	var hueDefault;
	var hueStart;
	var hueEnd;
	var valueStart;
	var valueEnd;
	
	if ( kronaElement.getAttribute('collapse') != undefined )
	{
		collapse = kronaElement.getAttribute('collapse') == 'true';
	}
	
	if ( kronaElement.getAttribute('key') != undefined )
	{
		showKeys = kronaElement.getAttribute('key') == 'true';
	}
	
	for
	(
		var element = getFirstChild(kronaElement);
		element;
		element = getNextSibling(element)
	)
	{
		switch ( element.tagName.toLowerCase() )
		{
			case 'attributes':
				magnitudeName = element.getAttribute('magnitude');
				//
				for
				(
					var attributeElement = getFirstChild(element);
					attributeElement;
					attributeElement = getNextSibling(attributeElement)
				)
				{
					var tag = attributeElement.tagName.toLowerCase();
					
					if ( tag == 'attribute' )
					{
						var attribute = new Attribute();
						attribute.name = attributeElement.firstChild.nodeValue.toLowerCase();
						attribute.displayName = attributeElement.getAttribute('display');
						
						if ( attributeElement.getAttribute('hrefBase') )
						{
							attribute.hrefBase = attributeElement.getAttribute('hrefBase');
						}
						
						if ( attributeElement.getAttribute('target') )
						{
							attribute.target = attributeElement.getAttribute('target');
						}
						
						if ( attribute.name == magnitudeName )
						{
							magnitudeIndex = attributes.length;
						}
						
						if ( attributeElement.getAttribute('listAll') )
						{
							attribute.listAll = attributeElement.getAttribute('listAll').toLowerCase();
						}
						else if ( attributeElement.getAttribute('listNode') )
						{
							attribute.listNode = attributeElement.getAttribute('listNode').toLowerCase();
						}
						else if ( attributeElement.getAttribute('dataAll') )
						{
							attribute.dataAll = attributeElement.getAttribute('dataAll').toLowerCase();
						}
						else if ( attributeElement.getAttribute('dataNode') )
						{
							attribute.dataNode = attributeElement.getAttribute('dataNode').toLowerCase();
						}
						
						if ( attributeElement.getAttribute('postUrl') )
						{
							attribute.postUrl = attributeElement.getAttribute('postUrl');
						}
						
						if ( attributeElement.getAttribute('postVar') )
						{
							attribute.postVar = attributeElement.getAttribute('postVar');
						}
						
						if ( attributeElement.getAttribute('mono') )
						{
							attribute.mono = true;
						}
						
						attributes.push(attribute);
					}
					else if ( tag == 'list' )
					{
						var attribute = new Attribute();
						
						attribute.name = attributeElement.firstChild.nodeValue;
						attribute.list = true;
						attributes.push(attribute);
					}
					else if ( tag == 'data' )
					{
						var attribute = new Attribute();
						
						attribute.name = attributeElement.firstChild.nodeValue;
						attribute.data = true;
						attributes.push(attribute);
						
						var enableScript = document.createElement('script');
						var date = new Date();
						enableScript.src =
							attributeElement.getAttribute('enable') + '?' +
							date.getTime();
						document.body.appendChild(enableScript);
					}
				}
				break;
			
			case 'color':
				hueName = element.getAttribute('attribute');
				hueStart = Number(element.getAttribute('hueStart')) / 360;
				hueEnd = Number(element.getAttribute('hueEnd')) / 360;
				valueStart = Number(element.getAttribute('valueStart'));
				valueEnd = Number(element.getAttribute('valueEnd'));
				//
				interpolateHue(hueStart, hueEnd, valueStart, valueEnd);
				//
				if ( element.getAttribute('default') == 'true' )
				{
					hueDefault = true;
				}
				break;
			
			case 'datasets':
				datasetNames = new Array();
				//
				for ( j = getFirstChild(element); j; j = getNextSibling(j) )
				{
					datasetNames.push(j.firstChild.nodeValue);
				}
				datasets = datasetNames.length;
				break;
			
			case 'node':
				head = loadTreeDOM
				(
					element,
					magnitudeName,
					hueName,
					hueStart,
					hueEnd,
					valueStart,
					valueEnd
				);
				break;
		}
	}
	
	// get GET options
	//
	var urlHalves = String(document.location).split('?');
	var datasetDefault = 0;
	var maxDepthDefault;
	var nodeDefault = 0;
	//
	if ( urlHalves[1] )
	{
		var vars = urlHalves[1].split('&');
		
		for ( i = 0; i < vars.length; i++ )
		{
			var pair = vars[i].split('=');
			
			switch ( pair[0] )
			{
				case 'collapse':
					collapse = pair[1] == 'true';
					break;
				
				case 'showMagnitude':
					showMagnitude = pair[1] == 'true';
					break;
				
				case 'color':
					hueDefault = pair[1] == 'true';
					break;
				
				case 'dataset':
					datasetDefault = Number(pair[1]);
					break;
					
				case 'depth':
					maxDepthDefault = Number(pair[1]) + 1;
					break;
				
				case 'key':
					showKeys = pair[1] == 'true';
					break;
				
				case 'font':
					fontSize = Number(pair[1]);
					break;
				
				case 'node':
					nodeDefault = Number(pair[1]);
					break;
				
				default:
					getVariables.push(pair[0] + '=' + pair[1]);
					break;
			}
		}
	}
	
	addOptionElements(hueName, hueDefault);
	setCallBacks();
	
	head.sort();
	maxAbsoluteDepth = 0;
	selectDataset(datasetDefault);
	
	if ( maxDepthDefault && maxDepthDefault < head.maxDepth )
	{
		maxAbsoluteDepth = maxDepthDefault;
	}
	else
	{
		maxAbsoluteDepth = head.maxDepth;
	}
	
	selectNode(nodes[nodeDefault]);
	
	setInterval(update, 20);
	
	window.onresize = handleResize;
	updateMaxAbsoluteDepth();
	updateViewNeeded = true;
}

function loadTreeDOM
(
	domNode,
	magnitudeName,
	hueName,
	hueStart,
	hueEnd,
	valueStart,
	valueEnd
)
{
	var newNode = new Node();
	
	newNode.name = domNode.getAttribute('name');
	
	if ( domNode.getAttribute('href') )
	{
		newNode.href = domNode.getAttribute('href');
	}
	
	if ( hueName )
	{
		newNode.hues = new Array();
	}
	
	for ( var i = getFirstChild(domNode); i; i = getNextSibling(i) )
	{
		switch ( i.tagName.toLowerCase() )
		{
		case 'node': 
			var newChild = loadTreeDOM
			(
				i,
				magnitudeName,
				hueName,
				hueStart,
				hueEnd,
				valueStart,
				valueEnd
			);
			newChild.parent = newNode;
			newNode.children.push(newChild);
			break;
			
		default:
			var attributeName = i.tagName.toLowerCase();
			var index = attributeIndex(attributeName);
			//
			newNode.attributes[index] = new Array();
			//
			for ( var j = getFirstChild(i); j; j = getNextSibling(j) )
			{
				if ( attributes[index] == undefined )
				{
					var x = 5;
				}
				if ( attributes[index].list )
				{
					newNode.attributes[index].push(new Array());
					
					for ( var k = getFirstChild(j); k; k = getNextSibling(k) )
					{
						newNode.attributes[index][newNode.attributes[index].length - 1].push(k.firstChild.nodeValue);
					}
				}
				else
				{
					var value = j.firstChild ? j.firstChild.nodeValue : '';
					
					if ( j.getAttribute('href') )
					{
						var target;
						
						if ( attributes[index].target )
						{
							target = ' target="' + attributes[index].target + '"';
						}
						
						value = '<a href="' + attributes[index].hrefBase + j.getAttribute('href') + '"' + target + '>' + value + '</a>';
					}
					
					newNode.attributes[index].push(value);
				}
			}
			//
			if ( attributeName == magnitudeName || attributeName == hueName )
			{
				for ( j = 0; j < datasets; j++ )
				{
					var value = newNode.attributes[index][j] == undefined ? 0 : Number(newNode.attributes[index][j]);
					
					newNode.attributes[index][j] = value;
					
					if ( attributeName == hueName )
					{
						var hue = lerp
						(
							value,
							valueStart,
							valueEnd,
							hueStart,
							hueEnd
						);
						
						if ( hue < hueStart == hueStart < hueEnd )
						{
							hue = hueStart;
						}
						else if ( hue > hueEnd == hueStart < hueEnd )
						{
							hue = hueEnd;
						}
						
						newNode.hues[j] = hue;
					}
				}
				
				if ( attributeName == hueName )
				{
					newNode.hue = new Tween(newNode.hues[0], newNode.hues[0]);
				}
			}
			break;
		}
	}
	
	return newNode;
}

function maxAbsoluteDepthDecrease()
{
	if ( maxAbsoluteDepth > 2 )
	{
		maxAbsoluteDepth--;
		head.setMaxDepths();
		handleResize();
	}
}

function maxAbsoluteDepthIncrease()
{
	if ( maxAbsoluteDepth < head.maxDepth )
	{
		maxAbsoluteDepth++;
		head.setMaxDepths();
		handleResize();
	}
}

function measureText(text, bold)
{
	context.font = bold ? fontBold : fontNormal;
	var dim = context.measureText(text);
	return dim.width;
}

function min(a, b)
{
	return a < b ? a : b;
}

function minWidth()
{
	// Min wedge width (at center) for displaying a node (or for displaying a
	// label if it's at the highest level being viewed, multiplied by 2 to make
	// further calculations simpler
	
	return (fontSize * 2.3);
}

function mouseMove(e)
{
	mouseX = e.pageX;
	mouseY = e.pageY - headerHeight;
	mouseXRel = (mouseX - centerX) * backingScale()
	mouseYRel = (mouseY - centerY) * backingScale()
	
	if ( head && ! quickLook )
	{
		checkHighlight();
	}
}

function mouseClick(e)
{
	if ( highlightedNode == focusNode && focusNode != selectedNode || selectedNode.hasParent(highlightedNode) )
	{
		if ( highlightedNode.hasChildren() )
		{
			expand(highlightedNode);
		}
	}
	else if ( progress == 1 )//( highlightedNode != selectedNode )
	{
		setFocus(highlightedNode);
//		document.body.style.cursor='ew-resize';
		draw();
		checkHighlight();
		var date = new Date();
		mouseDownTime = date.getTime();
		mouseDown = true;
	}
}

function mouseUp(e)
{
	if ( quickLook )
	{
		navigateBack();
		quickLook = false;
	}
	
	mouseDown = false;
}

function navigateBack()
{
	if ( nodeHistoryPosition > 0 )
	{
		nodeHistory[nodeHistoryPosition] = selectedNode;
		nodeHistoryPosition--;
		
		if ( nodeHistory[nodeHistoryPosition].collapse )
		{
			collapseCheckBox.checked = collapse = false;
		}
		
		setSelectedNode(nodeHistory[nodeHistoryPosition]);
		updateDatasetButtons();
		updateView();
	}
}

function navigateUp()
{
	if ( selectedNode.getParent() )
	{
		selectNode(selectedNode.getParent());
		updateView();
	}
}

function navigateForward()
{
	if ( nodeHistoryPosition < nodeHistory.length - 1 )
	{
		nodeHistoryPosition++;
		var newNode = nodeHistory[nodeHistoryPosition];
		
		if ( newNode.collapse )
		{
			collapseCheckBox.checked = collapse = false;
		}
		
		if ( nodeHistoryPosition == nodeHistory.length - 1 )
		{
			// this will ensure the forward button is disabled
			
			nodeHistory.length = nodeHistoryPosition;
		}
		
		setSelectedNode(newNode);
		updateDatasetButtons();
		updateView();
	}
}

function nextDataset()
{
	var newDataset = currentDataset;
	
	do
	{
		if ( newDataset == datasets - 1 )
		{
			newDataset = 0;
		}
		else
		{
			newDataset++;
		}
	}
	while ( datasetDropDown.options[newDataset].disabled )
	
	selectDataset(newDataset);
}

function onDatasetChange()
{
	selectDataset(datasetDropDown.selectedIndex);
}

function onKeyDown(event)
{
	if
	(
		event.keyCode == 37 &&
		document.activeElement.id != 'search' &&
		document.activeElement.id != 'linkText'
	)
	{
		navigateBack();
		event.preventDefault();
	}
	else if
	(
		event.keyCode == 39 &&
		document.activeElement.id != 'search' &&
		document.activeElement.id != 'linkText'
	)
	{
		navigateForward();
		event.preventDefault();
	}
	else if ( event.keyCode == 38 && datasets > 1 )
	{
		prevDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
	else if ( event.keyCode == 40 && datasets > 1 )
	{
		nextDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
	else if ( event.keyCode == 9 && datasets > 1 )
	{
		selectLastDataset();
		event.preventDefault();
	}
	else if ( event.keyCode == 83 )
	{
		progress += .2;
	}
	else if ( event.keyCode == 66 )
	{
		progress -= .2;
	}
	else if ( event.keyCode == 70 )
	{
		progress = 1;
	}
}

function onKeyPress(event)
{
	if ( event.keyCode == 38 && datasets > 1 )
	{
//		prevDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
	else if ( event.keyCode == 40 && datasets > 1 )
	{
//		nextDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
}

function onKeyUp(event)
{
	if ( event.keyCode == 27 && document.activeElement.id == 'search' )
	{
		search.value = '';
		onSearchChange();
	}
	else if ( event.keyCode == 38 && datasets > 1 )
	{
//		prevDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
	else if ( event.keyCode == 40 && datasets > 1 )
	{
//		nextDataset();
		
		//if ( document.activeElement.id == 'datasets' )
		{
			event.preventDefault();
		}
	}
}

function onSearchChange()
{
	nSearchResults = 0;
	head.search();
	
	if ( search.value == '' )
	{
		searchResults.innerHTML = '';
	}
	else
	{
		searchResults.innerHTML = nSearchResults + ' results';
	}
	
	setFocus(selectedNode);
	draw();
}

function post(url, variable, value, postWindow)
{
	var form = document.createElement('form');
	var input = document.createElement('input');
	var inputDataset = document.createElement('input');
	
	form.appendChild(input);
	form.appendChild(inputDataset);
	
	form.method = "POST";
	form.action = url;
	
	if ( postWindow == undefined )
	{
		form.target = '_blank';
		postWindow = window;
	}
	
	input.type = 'hidden';
	input.name = variable;
	input.value = value;
	
	inputDataset.type = 'hidden';
	inputDataset.name = 'dataset';
	inputDataset.value = currentDataset;
	
	postWindow.document.body.appendChild(form);
	form.submit();
}

function prevDataset()
{
	var newDataset = currentDataset;
	
	do
	{
		if ( newDataset == 0 )
		{
			newDataset = datasets - 1;
		}
		else
		{
			newDataset--;
		}
	}
	while ( datasetDropDown.options[newDataset].disabled );
	
	selectDataset(newDataset);
}

function radiusDecrease()
{
	if ( bufferFactor < .309 )
	{
		bufferFactor += .03;
		updateViewNeeded = true;
	}
}

function radiusIncrease()
{
	if ( bufferFactor > .041 )
	{
		bufferFactor -= .03;
		updateViewNeeded = true;
	}
}

function resetKeyOffset()
{
	currentKey = 1;
	keyMinTextLeft = centerX + gRadius + buffer - buffer / (keys + 1) / 2 + fontSize / 2;
	keyMinAngle = 0;
}

function rgbText(r, g, b)
{
	var rgbArray =
	[
		"rgb(",
		Math.floor(r),
		",",
		Math.floor(g),
		",",
		Math.floor(b),
		")"
	];
	
	return rgbArray.join('');
}

function round(number)
{
	if ( number >= 1 || number <= -1 )
	{
		return number.toFixed(0);
	}
	else
	{
		return number.toPrecision(1);
	}
}

function roundedRectangle(x, y, width, height, radius)
{
	if ( radius * 2 > width )
	{
		radius = width / 2;
	}
	
	if ( radius * 2 > height )
	{
		radius = height / 2;
	}
	
	context.beginPath();
	context.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2, false);
	context.lineTo(x + width - radius, y);
	context.arc(x + width - radius, y + radius, radius, Math.PI * 3 / 2, Math.PI * 2, false);
	context.lineTo(x + width, y + height - radius);
	context.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
	context.lineTo(x + radius, y + height);
	context.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
	context.lineTo(x, y + radius);
}

function passClick(e)
{
	mouseClick(e);
}

function searchResultString(results)
{
	var searchResults = this.searchResults;
	
	if ( this.isSearchResult )
	{
		// don't count ourselves
		searchResults--;
	}
	
	return ' - ' + results + (results > 1 ? ' results' : ' result');
}

function setCallBacks()
{
	canvas.onselectstart = function(){return false;} // prevent unwanted highlighting
	options.onselectstart = function(){return false;} // prevent unwanted highlighting
	document.onmousemove = mouseMove;
	window.onblur = focusLost;
	window.onmouseout = focusLost;
	document.onkeyup = onKeyUp;
	document.onkeydown = onKeyDown;
	canvas.onmousedown = mouseClick;
	document.onmouseup = mouseUp;
	keyControl.onclick = toggleKeys;
	showMagnitudeCheckBox = document.getElementById('showMagnitude');
	showMagnitudeCheckBox.checked = showMagnitude;
	showMagnitudeCheckBox.onclick = handleResize;
	collapseCheckBox = document.getElementById('collapse');
	collapseCheckBox.checked = collapse;
	collapseCheckBox.onclick = handleResize;
	collapseCheckBox.onmousedown = suppressEvent;
	maxAbsoluteDepthText = document.getElementById('maxAbsoluteDepth');
	maxAbsoluteDepthButtonDecrease = document.getElementById('maxAbsoluteDepthDecrease');
	maxAbsoluteDepthButtonIncrease = document.getElementById('maxAbsoluteDepthIncrease');
	maxAbsoluteDepthButtonDecrease.onclick = maxAbsoluteDepthDecrease;
	maxAbsoluteDepthButtonIncrease.onclick = maxAbsoluteDepthIncrease;
	maxAbsoluteDepthButtonDecrease.onmousedown = suppressEvent;
	maxAbsoluteDepthButtonIncrease.onmousedown = suppressEvent;
	fontSizeText = document.getElementById('fontSize');
	fontSizeButtonDecrease = document.getElementById('fontSizeDecrease');
	fontSizeButtonIncrease = document.getElementById('fontSizeIncrease');
	fontSizeButtonDecrease.onclick = fontSizeDecrease;
	fontSizeButtonIncrease.onclick = fontSizeIncrease;
	fontSizeButtonDecrease.onmousedown = suppressEvent;
	fontSizeButtonIncrease.onmousedown = suppressEvent;
	radiusButtonDecrease = document.getElementById('radiusDecrease');
	radiusButtonIncrease = document.getElementById('radiusIncrease');
	radiusButtonDecrease.onclick = radiusDecrease;
	radiusButtonIncrease.onclick = radiusIncrease;
	radiusButtonDecrease.onmousedown = suppressEvent;
	radiusButtonIncrease.onmousedown = suppressEvent;
	maxAbsoluteDepth = 0;
	backButton = document.getElementById('back');
	backButton.onclick = navigateBack;
	backButton.onmousedown = suppressEvent;
	forwardButton = document.getElementById('forward');
	forwardButton.onclick = navigateForward;
	forwardButton.onmousedown = suppressEvent;
	snapshotButton = document.getElementById('snapshot');
	snapshotButton.onclick = snapshot;
	snapshotButton.onmousedown = suppressEvent;
	detailsName = document.getElementById('detailsName');
	detailsExpand = document.getElementById('detailsExpand');
	detailsInfo = document.getElementById('detailsInfo');
	search = document.getElementById('search');
	search.onkeyup = onSearchChange;
	search.onmousedown = suppressEvent;
	searchResults = document.getElementById('searchResults');
	useHueDiv = document.getElementById('useHueDiv');
	linkButton = document.getElementById('linkButton');
	linkButton.onclick = showLink;
	linkButton.onmousedown = suppressEvent;
	linkText = document.getElementById('linkText');
	linkText.onblur = hideLink;
	linkText.onmousedown = suppressEvent;
	hide(linkText);
	var helpButton = document.getElementById('help');
	helpButton.onmousedown = suppressEvent;
	var searchClear = document.getElementById('searchClear');
	searchClear.onmousedown = suppressEvent;
	if ( datasets > 1 )
	{
		datasetDropDown.onmousedown = suppressEvent;
		var prevDatasetButton = document.getElementById('prevDataset');
		prevDatasetButton.onmousedown = suppressEvent;
		var nextDatasetButton = document.getElementById('nextDataset');
		nextDatasetButton.onmousedown = suppressEvent;
		var lastDatasetButton = document.getElementById('lastDataset');
		lastDatasetButton.onmousedown = suppressEvent;
	}
	// === callbacks pour le bouton Style ===
    var styleButton = document.getElementById('style-btn');
    styleButton.onclick = function(e) {
        e.stopPropagation();
        openStylePanel();
        // TODO: ouvrir/peupler ton panneau ici
    };
    styleButton.onmousedown = suppressEvent;
    
	image = document.getElementById('hiddenImage');
	
	if ( image.complete )
	{
		hiddenPattern = context.createPattern(image, 'repeat');
	}
	else
	{
		image.onload = function()
		{
			hiddenPattern = context.createPattern(image, 'repeat');
		}
	}
	
	var loadingImageElement = document.getElementById('loadingImage');
	
	if ( loadingImageElement )
	{
		loadingImage = loadingImageElement.src;
	}
}

function selectDataset(newDataset)
{
	lastDataset = currentDataset;
	currentDataset = newDataset
	if ( datasets > 1 )
	{
		datasetDropDown.selectedIndex = currentDataset;
		updateDatasetButtons();
		datasetAlpha.start = 1.5;
		datasetChanged = true;
	}
	head.setMagnitudes(0);
	head.setDepth(1, 1);
	head.setMaxDepths();
	handleResize();
}

function selectLastDataset()
{
	selectDataset(lastDataset);
	handleResize();
}

function selectNode(newNode)
{
	if ( selectedNode != newNode )
	{
		// truncate history at current location to create a new branch
		//
		nodeHistory.length = nodeHistoryPosition;
		
		if ( selectedNode != 0 )
		{
			nodeHistory.push(selectedNode);
			nodeHistoryPosition++;
		}
		
		setSelectedNode(newNode);
		//updateView();
	}
	
	updateDatasetButtons();
}

function setFocus(node)
{
	if ( node == focusNode )
	{
//		return;
	}
	
	focusNode = node;
	
	if ( node.href )
	{
		detailsName.innerHTML =
			'<a target="_blank" href="' + node.href + '">' + node.name + '</a>';
	}
	else
	{
		detailsName.innerHTML = node.name;
	}
	
	var table = '<table>';
	//TODO: use CSS margins instead of an additional column
	table += '<tr><td></td><td></td></tr>';
	
	for ( var i = 0; i < node.attributes.length; i++ )
	{
		if ( attributes[i].displayName && node.attributes[i] != undefined )
		{
			var index = node.attributes[i].length == 1 && attributes[i].mono ? 0 : currentDataset;
			
			if ( typeof node.attributes[i][currentDataset] == 'number' || node.attributes[i][index] != undefined && node.attributes[i][currentDataset] != '' )
			{
				var value = node.attributes[i][index];
				
				if ( attributes[i].listNode != undefined )
				{
					value =
						'<a href="" onclick="showList(' +
						attributeIndex(attributes[i].listNode) + ',' + i +
						',false);return false;" title="Show list">' +
						value + '</a>';
				}
				else if ( attributes[i].listAll != undefined )
				{
					value =
						'<a href="" onclick="showList(' +
						attributeIndex(attributes[i].listAll) + ',' + i +
						',true);return false;" title="Show list">' +
						value + '</a>';
				}
				else if ( attributes[i].dataNode != undefined && dataEnabled )
				{
					value =
						'<a href="" onclick="showData(' +
						attributeIndex(attributes[i].dataNode) + ',' + i +
						',false);return false;" title="Show data">' +
						value + '</a>';
				}
				else if ( attributes[i].dataAll != undefined && dataEnabled )
				{
					value =
						'<a href="" onclick="showData(' +
						attributeIndex(attributes[i].dataAll) + ',' + i +
						',true);return false;" title="Show data">' +
						value + '</a>';
				}
				
				table +=
					'<tr><td><strong>' + attributes[i].displayName + ':</strong></td><td>' +
					value + '</td></tr>';
			}
		}
	}
	
	table += '</table>';
	detailsInfo.innerHTML = table;
	
	detailsExpand.disabled = !focusNode.hasChildren() || focusNode == selectedNode;
}

function setSelectedNode(newNode)
{
	if ( selectedNode && selectedNode.hasParent(newNode) )
	{
		zoomOut = true;
	}
	else
	{
		zoomOut = false;
	}
	
	selectedNodeLast = selectedNode;
	selectedNode = newNode;
	
	//if ( focusNode != selectedNode )
	{
		setFocus(selectedNode);
	}
}

function waitForData(dataWindow, target, title, time, postUrl, postVar)
{
	if ( nodeData.length == target )
	{
		if ( postUrl != undefined )
		{
			for ( var i = 0; i < nodeData.length; i++ )
			{
				nodeData[i] = nodeData[i].replace(/\n/g, ',');
			}
			
			var postString = nodeData.join('');
			postString = postString.slice(0, -1);
			
			dataWindow.document.body.removeChild(dataWindow.document.getElementById('loading'));
			document.body.removeChild(document.getElementById('data'));
			
			post(postUrl, postVar, postString, dataWindow);
		}
		else
		{
			//dataWindow.document.body.removeChild(dataWindow.document.getElementById('loading'));
			//document.body.removeChild(document.getElementById('data'));
			
			dataWindow.document.open();
			dataWindow.document.write('<pre>' + nodeData.join('') + '</pre>');
			dataWindow.document.close();
		}
		
		dataWindow.document.title = title; // replace after document.write()
	}
	else
	{
		var date = new Date();
		
		if ( date.getTime() - time > 10000 )
		{
			dataWindow.document.body.removeChild(dataWindow.document.getElementById('loading'));
			document.body.removeChild(document.getElementById('data'));
			dataWindow.document.body.innerHTML =
				'Timed out loading supplemental files for:<br/>' + document.location;
		}
		else
		{
			setTimeout(function() {waitForData(dataWindow, target, title, time, postUrl, postVar);}, 100);
		}
	}
}

function data(newData)
{
	nodeData.push(newData);
}

function enableData()
{
	dataEnabled = true;
}

function showData(indexData, indexAttribute, summary)
{
	var dataWindow = window.open('', '_blank');
	var title = 'Krona - ' + attributes[indexAttribute].displayName + ' - ' + focusNode.name;
	dataWindow.document.title = title;
	
	nodeData = new Array();
	
	if ( dataWindow && dataWindow.document && dataWindow.document.body != null )
	{
		//var loadImage = document.createElement('img');
		//loadImage.src = "file://localhost/Users/ondovb/Krona/KronaTools/img/loading.gif";
		//loadImage.id = "loading";
		//loadImage.alt = "Loading...";
		//dataWindow.document.body.appendChild(loadImage);
		dataWindow.document.body.innerHTML =
			'<img id="loading" src="' + loadingImage + '" alt="Loading..."></img>';
	}
	
	var scripts = document.createElement('div');
	scripts.id = 'data';
	document.body.appendChild(scripts);
	
	var files = focusNode.getData(indexData, summary);
	
	var date = new Date();
	var time = date.getTime();
	
	for ( var i = 0; i < files.length; i++ )
	{
		var script = document.createElement('script');
		script.src = files[i] + '?' + time;
		scripts.appendChild(script);
	}
	
	waitForData(dataWindow, files.length, title, time, attributes[indexAttribute].postUrl, attributes[indexAttribute].postVar);
	
	return false;
}

function showList(indexList, indexAttribute, summary)
{
	var list = focusNode.getList(indexList, summary);
	
	if ( attributes[indexAttribute].postUrl != undefined )
	{
		post(attributes[indexAttribute].postUrl, attributes[indexAttribute].postVar, list.join(','));
	}
	else
	{
		var dataWindow = window.open('', '_blank');
		
		if ( true || navigator.appName == 'Microsoft Internet Explorer' ) // :(
		{
			dataWindow.document.open();
			dataWindow.document.write('<pre>' + list.join('\n') + '</pre>');
			dataWindow.document.close();
		}
		else
		{
			var pre = document.createElement('pre');
			dataWindow.document.body.appendChild(pre);
			pre.innerHTML = list;
		}
		
		dataWindow.document.title = 'Krona - ' + attributes[indexAttribute].displayName + ' - ' + focusNode.name;
	}
}

function snapshot()
{
	svg = svgHeader();
	
	resetKeyOffset();
	
	snapshotMode = true;
	
	selectedNode.draw(false, true);
	selectedNode.draw(true, true);
	
	if ( focusNode != 0 && focusNode != selectedNode )
	{
		context.globalAlpha = 1;
		focusNode.drawHighlight(true);
	}
	
	if ( hueDisplayName && useHue() )
	{
		drawLegendSVG();
	}
	
	snapshotMode = false;
	
	svg += svgFooter();
	var dataUri = 'data:image/svg+xml,' + encodeURIComponent(svg)
	var string = '<html><body><iframe src="' + dataUri + '" frameborder="0" style="position:absolute; border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe><a style="position:absolute" href="' + dataUri + '" download="snapshot.svg">Download Snapshot</a></html></body>';
    var win = window.open();
    win.document.write(string)
}

function save()
{
	alert(document.body.innerHTML);
}

function spacer()
{
	if ( snapshotMode )
	{
		return '&#160;&#160;&#160;';
	}
	else
	{
		return '   ';
	}
}

function suppressEvent(e)
{
	e.cancelBubble = true;
	if (e.stopPropagation) e.stopPropagation();
}

function svgFooter()
{
	return '</svg>';
}

function svgHeader()
{
	var patternWidth = fontSize * .6;//radius / 50;
	
	return '\
<?xml version="1.0" standalone="no"?>\
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" \
	"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\
<svg width="' + imageWidth + '" height="' + imageHeight + '" version="1.1"\
	xmlns="http://www.w3.org/2000/svg">\
<title>Krona (snapshot) - ' +
(datasets > 1 ? datasetNames[currentDataset] + ' - ' : '') + selectedNode.name +
'</title>\
<defs>\
	<style type="text/css">\
	text {font-size: ' + fontSize + 'px; font-family: ' + fontFamily + '; dominant-baseline:central}\
	path {stroke-width:' + thinLineWidth * fontSize / 12 + ';}\
	path.wedge {stroke:none}\
	path.line {fill:none;stroke:black;}\
	line {stroke:black;stroke-width:' + thinLineWidth * fontSize / 12 + ';}\
	line.tick {stroke-width:' + thinLineWidth * fontSize / 6 + ';}\
	line.pattern {stroke-width:' + thinLineWidth * fontSize / 18 + ';}\
	circle {fill:none;stroke:black;stroke-width:' + thinLineWidth * fontSize / 12 + ';}\
	rect {stroke:black;stroke-width:' + thinLineWidth * fontSize / 12 + ';}\
	.highlight {stroke:black;stroke-width:'+ highlightLineWidth * fontSize / 12 + ';}\
	.searchHighlight {fill:rgb(255, 255, 100);stroke:none;}\
	</style>\
<pattern id="hiddenPattern" patternUnits="userSpaceOnUse" \
x="0" y="0" width="' + patternWidth + '" height="' + patternWidth + '">\
<line class="pattern" x1="0" y1="0" x2="' + patternWidth / 2 + '" y2="' + patternWidth / 2 + '"/>\
<line class="pattern" x1="' + patternWidth / 2 + '" y1="' + patternWidth +
'" x2="' + patternWidth + '" y2="' + patternWidth / 2 + '"/>\
</pattern>\
</defs>\
';
}

function svgText(text, x, y, anchor, bold, color)
{
	if ( typeof(anchor) == 'undefined' )
	{
		anchor = 'start';
	}
	
	if ( color == undefined )
	{
		color = 'black';
	}
	
	return '<text x="' + x + '" y="' + y +
		'" style="font-color:' + color + ';font-weight:' + (bold ? 'bold' : 'normal') +
		'" text-anchor="' + anchor + '">' + text + '</text>';
}

function toggleKeys()
{
	if ( showKeys )
	{
		keyControl.value = '…';
		showKeys = false;
	}
	else
	{
		keyControl.value = 'x';
		showKeys = true;
	}
	
	updateKeyControl();
	
	if ( progress == 1 )
	{
		draw();
	}
}

function update()
{
	if ( ! head )
	{
		return;
	}
	
	if ( mouseDown && focusNode != selectedNode )
	{
		var date = new Date();
		
		if ( date.getTime() - mouseDownTime > quickLookHoldLength )
		{
			if ( focusNode.hasChildren() )
			{
				expand(focusNode);
				quickLook = true;
			}
		}
	}
	
	if ( updateViewNeeded )
	{
		resize();
		mouseX = -1;
		mouseY = -1;
		
		collapse = collapseCheckBox.checked;
		showMagnitude = showMagnitudeCheckBox.checked;
		compress = true;//compressCheckBox.checked;
		shorten = true;//shortenCheckBox.checked;
		
		checkSelectedCollapse();
		updateMaxAbsoluteDepth();
		
		if ( focusNode.getCollapse() || focusNode.depth > maxAbsoluteDepth )
		{
			setFocus(selectedNode);
		}
		else
		{
			setFocus(focusNode);
		}
		
		updateView();
		
		updateViewNeeded = false;
	}
	
	var date = new Date();
	progress = (date.getTime() - tweenStartTime) / tweenLength;
//	progress += .01;
	
	if ( progress >= 1 )
	{
		progress = 1;
	}
	
	if ( progress != progressLast )
	{
		tweenFactor =// progress;
			(1 / (1 + Math.exp(-tweenCurvature * (progress - .5))) - .5) /
			(tweenMax - .5) / 2 + .5;
		
		if ( progress == 1 )
		{
			snapshotButton.disabled = false;
			zoomOut = false;
			
			//updateKeyControl();
			
			if ( ! quickLook )
			{
				//checkHighlight();
			}
			
			
			if ( fpsDisplay )
			{
				fpsDisplay.innerHTML = 'fps: ' + Math.round(tweenFrames * 1000 / tweenLength);
			}
		}
		
		draw();
	}
	
	progressLast = progress;
}

function updateDatasetButtons()
{
	if ( datasets == 1 )
	{
		return;
	}
	
	var node = selectedNode ? selectedNode : head;
	
	datasetButtonLast.disabled =
		node.attributes[magnitudeIndex][lastDataset] == 0;
	
	datasetButtonPrev.disabled = true;
	datasetButtonNext.disabled = true;
	
	for ( var i = 0; i < datasets; i++ )
	{
		var disable = node.attributes[magnitudeIndex][i] == 0;
		
		datasetDropDown.options[i].disabled = disable;
		
		if ( ! disable )
		{
			if ( i != currentDataset )
			{
				datasetButtonPrev.disabled = false;
				datasetButtonNext.disabled = false;
			}
		}
	}
}

function updateDatasetWidths()
{
	if ( datasets > 1 )
	{
		for ( var i = 0; i < datasets; i++ )
		{
			context.font = fontBold;
			var dim = context.measureText(datasetNames[i]);
			datasetWidths[i] = dim.width;
		}
	}
}

function updateKeyControl()
{
	if ( keys == 0 )//|| progress != 1 )
	{
		keyControl.style.visibility = 'hidden';
	}
	else
	{
		keyControl.style.visibility = 'visible';
		keyControl.style.right = margin + 'px';
		
		if ( showKeys )
		{
			keyControl.style.top =
				imageHeight -
				(
					keys * (keySize + keyBuffer) -
					keyBuffer +
					margin +
					keyControl.clientHeight * 1.5
				) + 'px';
		}
		else
		{
			keyControl.style.top =
				(imageHeight - margin - keyControl.clientHeight) + 'px';
		}
	}
}

function updateView()
{
	if ( selectedNode.depth > maxAbsoluteDepth - 1 )
	{
		maxAbsoluteDepth = selectedNode.depth + 1;
	}
	
	highlightedNode = selectedNode;
	
	angleFactor = 2 * Math.PI / (selectedNode.magnitude);
	
	maxPossibleDepth = Math.floor(gRadius / (fontSize * minRingWidthFactor));
	
	if ( maxPossibleDepth < 4 )
	{
		maxPossibleDepth = 4;
	}
	
	var minRadiusInner = fontSize * 8 / gRadius;
	var minRadiusFirst = fontSize * 6 / gRadius;
	var minRadiusOuter = fontSize * 5 / gRadius;
	
	if ( .25 < minRadiusInner )
	{
		minRadiusInner = .25;
	}
	
	if ( .15 < minRadiusFirst )
	{
		minRadiusFirst = .15;
	}
	
	if ( .15 < minRadiusOuter )
	{
		minRadiusOuter = .15;
	}
	
	// visibility of nodes depends on the depth they are displayed at,
	// so we need to set the max depth assuming they can all be displayed
	// and iterate it down based on the deepest child node we can display
	//
	var maxDepth;
	var newMaxDepth = selectedNode.getMaxDepth() - selectedNode.getDepth() + 1;
	//
	do
	{
		maxDepth = newMaxDepth;
		
		if ( ! compress && maxDepth > maxPossibleDepth )
		{
			maxDepth = maxPossibleDepth;
		}
		
		if ( compress )
		{
			compressedRadii = new Array(maxDepth);
			
			compressedRadii[0] = minRadiusInner;
			
			var offset = 0;
			
			while
			(
				lerp
				(
					Math.atan(offset + 2),
					Math.atan(offset + 1),
					Math.atan(maxDepth + offset - 1),
					minRadiusInner,
					1 - minRadiusOuter
				) - minRadiusInner > minRadiusFirst &&
				offset < 10
			)
			{
				offset++;
			}
			
			offset--;
			
			for ( var i = 1; i < maxDepth; i++ )
			{
				compressedRadii[i] = lerp
				(
					Math.atan(i + offset),
					Math.atan(offset),
					Math.atan(maxDepth + offset - 1),
					minRadiusInner,
					1 - minRadiusOuter
				)
			}
		}
		else
		{
			nodeRadius = 1 / maxDepth;
		}
		
		newMaxDepth = selectedNode.maxVisibleDepth(maxDepth);
		
		if ( compress )
		{
			if ( newMaxDepth <= maxPossibleDepth )
			{
//				compress
			}
		}
		else
		{
			if ( newMaxDepth > maxPossibleDepth )
			{
				newMaxDepth = maxPossibleDepth;
			}
		}
	}
	while ( newMaxDepth < maxDepth );
	
	maxDisplayDepth = maxDepth;
	
	lightnessFactor = (lightnessMax - lightnessBase) / (maxDepth > 8 ? 8 : maxDepth);
	keys = 0;
	
	nLabelOffsets = new Array(maxDisplayDepth - 1);
	labelOffsets = new Array(maxDisplayDepth - 1);
	labelLastNodes = new Array(maxDisplayDepth - 1);
	labelFirstNodes = new Array(maxDisplayDepth - 1);
	
	for ( var i = 0; i < maxDisplayDepth - 1; i++ )
	{
		if ( compress )
		{
			if ( i == maxDisplayDepth - 1 )
			{
				nLabelOffsets[i] = 0;
			}
			else
			{
				var width =
					(compressedRadii[i + 1] - compressedRadii[i]) *
					gRadius;
				
				nLabelOffsets[i] = Math.floor(width / fontSize / 1.2);
				
				if ( nLabelOffsets[i] > 2 )
				{
					nLabelOffsets[i] = min
					(
						Math.floor(width / fontSize / 1.75),
						5
					);
				}
			}
		}
		else
		{
			nLabelOffsets[i] = Math.max
			(
				Math.floor(Math.sqrt((nodeRadius * gRadius / fontSize)) * 1.5),
				3
			);
		}
		
		labelOffsets[i] = Math.floor((nLabelOffsets[i] - 1) / 2);
		labelLastNodes[i] = new Array(nLabelOffsets[i] + 1);
		labelFirstNodes[i] = new Array(nLabelOffsets[i] + 1);
		
		for ( var j = 0; j <= nLabelOffsets[i]; j++ )
		{
			// these arrays will allow nodes with neighboring labels to link to
			// each other to determine max label length
			
			labelLastNodes[i][j] = 0;
			labelFirstNodes[i][j] = 0;
		}
	}
	
	fontSizeText.innerHTML = fontSize;
	fontNormal = fontSize + 'px ' + fontFamily;
	context.font = fontNormal;
	fontBold = 'bold ' + fontSize + 'px ' + fontFamily;
	tickLength = fontSize * .7;
	
	head.setTargets(0);
	
	keySize = ((imageHeight - margin * 3) * 1 / 2) / keys * 3 / 4;
	
	if ( keySize > fontSize * maxKeySizeFactor )
	{
		keySize = fontSize * maxKeySizeFactor;
	}
	
	keyBuffer = keySize / 3;
	
	fontSizeLast = fontSize;
	
	if ( datasetChanged )
	{
		datasetChanged = false;
	}
	else
	{
		datasetAlpha.start = 0;
	}
	
	var date = new Date();
	tweenStartTime = date.getTime();
	progress = 0;
	tweenFrames = 0;
	
	updateKeyControl();
	updateDatasetWidths();
	
	document.title = 'Krona - ' + selectedNode.name;
	updateNavigationButtons();
	snapshotButton.disabled = true;
	
	maxAbsoluteDepthText.innerHTML = maxAbsoluteDepth - 1;
	
	maxAbsoluteDepthButtonDecrease.disabled = (maxAbsoluteDepth == 2);
	maxAbsoluteDepthButtonIncrease.disabled = (maxAbsoluteDepth == head.maxDepth);
	
	if ( collapse != collapseLast && search.value != '' )
	{
		onSearchChange();
		collapseLast = collapse;
	}
}

function updateMaxAbsoluteDepth()
{
	while ( maxAbsoluteDepth > 1 && selectedNode.depth > maxAbsoluteDepth - 1 )
	{
		selectedNode = selectedNode.getParent();
	}
}

function updateNavigationButtons()
{
	backButton.disabled = (nodeHistoryPosition == 0);
//	upButton.disabled = (selectedNode.getParent() == 0);
	forwardButton.disabled = (nodeHistoryPosition == nodeHistory.length);
}

function useHue()
{
	return useHueCheckBox && useHueCheckBox.checked;
}

function openStylePanel() {

  const existing = document.getElementById('style-panel');
  if (existing) {
    existing.remove();
    return;
  }

  if (typeof head === 'undefined') {
    console.error('Krona non initialisé (head undefined)');
    return;
  }
  const rootNode = head;
  const panel = document.createElement('div');
  panel.id = 'style-panel';
  Object.assign(panel.style, {
    position:   'absolute',
    top:        '10%',
    right:      '2%',
    width:      '240px',
    padding:    '12px',
    background: 'rgba(255,255,255,0.95)',
    border:     '1px solid #999',
    boxShadow:  '0 4px 8px rgba(0,0,0,0.2)',
    zIndex:     10000,
    fontSize:   '14px',
    fontFamily: 'sans-serif',
    overflowY:  'auto',
    maxHeight:  '80%'
  });

	panel.innerHTML = `
	  <div style="margin-bottom:10px;"><strong>Color mode</strong></div>
	  <label><input type="radio" name="colormode" value="multi" checked> Multicolor</label><br>
	  <label><input type="radio" name="colormode" value="single"> Uniform</label>
	  <div id="invert-container" style="display:none; margin:8px 0;">
		<label><input type="checkbox" id="invert-gradient"> Invert gradient</label>
	  </div>
	  <button id="colors-btn" style="display:none; width:100%; margin-bottom:8px;">Choose color</button>
	  <input id="color-picker" type="color" style="display:none; width:100%; margin-bottom:8px;">
	  <button id="reset-colors-btn" style="display:none; width:100%; margin-bottom:10px;">Reset colors</button>
	  <hr>
	  <div style="margin:10px 0 4px;"><strong>Specific taxon</strong></div>
	  <select id="taxon-selector" style="width:100%; margin-bottom:8px;">
		<option value="">-- Select --</option>
	  </select>
	  <input id="taxon-color-picker" type="color" style="display:none; width:100%; margin-bottom:8px;">
	  <button id="reset-taxon-btn" style="display:none; width:100%; margin-bottom:8px;">Reset taxon</button>
	  <button id="reset-all-btn" style="width:100%; margin-top:10px;">Reset all</button>
	`;

  document.body.appendChild(panel);

  const colorsBtn       = panel.querySelector('#colors-btn');
  const colorPicker     = panel.querySelector('#color-picker');
  const resetBtn        = panel.querySelector('#reset-colors-btn');
  const invertGrad      = panel.querySelector('#invert-gradient');
  const invertContainer = panel.querySelector('#invert-container');
  const taxonSelect     = panel.querySelector('#taxon-selector');
  const taxonPicker     = panel.querySelector('#taxon-color-picker');
  const resetTaxonBtn = panel.querySelector('#reset-taxon-btn');
  const resetAllBtn   = panel.querySelector('#reset-all-btn');

  resetAllBtn.style.display = Object.keys(overrideColors).length ? 'block' : 'none';
  
    (function collect(node) {
    const opt = document.createElement('option');
    opt.value = node.name;
    opt.textContent = node.name;
    taxonSelect.appendChild(opt);
    (node.children || []).forEach(collect);
  })(rootNode);

  invertContainer.style.display = 'none';

  // Mode color change
  panel.querySelectorAll('input[name="colormode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const single = radio.value === 'single';
      colorsBtn.style.display       = single ? 'block' : 'none';
      invertContainer.style.display = single ? 'block' : 'none';
      // reset overrides
      overrideHSL = null;
      invertPalette = false;
      updateViewNeeded = true;
    });
  });

  // Uniform color picker
  colorsBtn.addEventListener('click', e => {
    e.stopPropagation();
    colorPicker.style.display =
      colorPicker.style.display === 'none' ? 'block' : 'none';
  });
  colorPicker.addEventListener('input', e => {
    overrideHSL = hexToHSL(e.target.value);
    resetBtn.style.display = 'block';
    updateViewNeeded = true;
  });
  resetBtn.addEventListener('click', e => {
    e.stopPropagation();
    overrideHSL = null;
    resetBtn.style.display = 'none';
    colorPicker.style.display = 'none';
    updateViewNeeded = true;
  });
  invertGrad.addEventListener('change', e => {
    invertPalette = e.target.checked;
    updateViewNeeded = true;
  });

  // Taxon selector
  taxonSelect.addEventListener('change', () => {
    const hasOverride = overrideColors.hasOwnProperty(taxonSelect.value);
	taxonPicker.style.display      = taxonSelect.value ? 'block' : 'none';
	resetTaxonBtn.style.display    = hasOverride ? 'block' : 'none';
  });
  taxonPicker.addEventListener('input', e => {
    if (taxonSelect.value) {
      overrideColors[taxonSelect.value] = e.target.value;
      updateViewNeeded = true;
      resetTaxonBtn.style.display = 'block';
      resetAllBtn.style.display = Object.keys(overrideColors).length ? 'block' : 'none';
    }
  });
  resetTaxonBtn.addEventListener('click', e => {
    e.stopPropagation();
    const key = taxonSelect.value;
    if (!key) return;
    delete overrideColors[key];
    resetTaxonBtn.style.display = 'none';
    taxonPicker.style.display   = 'none';
    taxonSelect.value = '';      
    updateViewNeeded = true;
  });
  resetAllBtn.addEventListener('click', e => {
    e.stopPropagation();
    Object.keys(overrideColors).forEach(key => {
      delete overrideColors[key];
    });
    updateViewNeeded = true;
    resetTaxonBtn.style.display = 'none';
    taxonPicker.style.display   = 'none';
    taxonSelect.value           = '';
    resetAllBtn.style.display   = 'none';
  });

}

function getNodeColor(node, baseColor) {
  if (overrideColors[node.name]) {
    return overrideColors[node.name];
  }
  if (overrideHSL) {
    const pct    = (node.endAngle - node.startAngle) / (2 * Math.PI);
    const eff    = invertPalette ? 1 - pct : pct;
    const L      = 30 + eff * 50;
    return `hsl(${overrideHSL.h},${overrideHSL.s}%,${L}%)`;
  }
  return baseColor;
}




function createColorsBtn(parent) {
  const btn = document.createElement('button');
  btn.id = 'colors-btn';
  btn.textContent = 'Colors';
  btn.style.display = 'none';
  parent.appendChild(btn);
  return btn;
}
function createColorPicker(parent) {
  const inp = document.createElement('input');
  inp.type = 'color';
  inp.id = 'color-picker';
  inp.style.display = 'none';
  parent.appendChild(inp);
  return inp;
}
function createResetBtn(parent) {
  const btn = document.createElement('button');
  btn.id = 'reset-colors-btn';
  btn.textContent = 'Reset';
  btn.style.display = 'none';
  parent.appendChild(btn);
  return btn;
}


function hexToHSL(H) {
  H = H.replace(/^#/, '');
  let r = parseInt(H.substr(0,2),16)/255;
  let g = parseInt(H.substr(2,2),16)/255;
  let b = parseInt(H.substr(4,2),16)/255;
  let max = Math.max(r,g,b), min = Math.min(r,g,b), h=0, s=0, l=(max+min)/2, d = max-min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2*l - 1));
    switch(max){
      case r: h = ((g - b)/d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r)/d + 2); break;
      case b: h = ((r - g)/d + 4); break;
    }
    h /= 6;
  }
  return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
}

function renderLoop() {
  if (updateViewNeeded) {
    context.clearRect(-w/2, -h/2, w, h);
    drawHierarchy(root, 0); 
    updateViewNeeded = false;
  }
  requestAnimationFrame(renderLoop);
}
renderLoop();

/*
function zoomOut()
{
	return (
		selectedNodeLast != 0 &&
		selectedNodeLast.getDepth() < selectedNode.getDepth());
}
*/
