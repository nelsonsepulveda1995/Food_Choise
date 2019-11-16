var cSpeed=9;
var cWidth=250;
var cHeight=250;
var cTotalFrames=40;
var cFrameWidth=250;
var cImageSrc;

var cImageTimeout=false;
var cIndex=0;
var cXpos=0;
var cPreloaderTimeout=false;
var SECONDS_BETWEEN_FRAMES=0;

function startAnimation(){
    
    document.getElementById('loaderImage').style.backgroundImage='url('+cImageSrc+')';
    document.getElementById('loaderImage').style.width=cWidth+'px';
    document.getElementById('loaderImage').style.height=cHeight+'px';
    cPreloaderTimeout=setTimeout('continueAnimation()', 70);
    
    
}

function continueAnimation(){
    
    cXpos += cFrameWidth;
    //increase the index so we know which frame of our animation we are currently on
    cIndex += 1;
     
    //if our cIndex is higher than our total number of frames, we're at the end and should restart
    if (cIndex >= cTotalFrames) {
        cXpos =0;
        cIndex=0;
    }
    
    if(document.getElementById('loaderImage'))
        document.getElementById('loaderImage').style.backgroundPosition=(-cXpos)+'px 0';
    
    cPreloaderTimeout=setTimeout('continueAnimation()', 70);
    
}

function stopAnimation(){//stops animation
    clearTimeout(cPreloaderTimeout);
    cPreloaderTimeout=false;
}

function imageLoader(s, fun)//Pre-loads the sprites image
{
    cImageSrc=s;
    clearTimeout(cImageTimeout);
    cImageTimeout=0;
    genImage = new Image();
    genImage.onload=function (){cImageTimeout=setTimeout(fun, 100)};
    genImage.onerror=new Function('alert(\'Could not load the image\')');
    genImage.src=s;
}