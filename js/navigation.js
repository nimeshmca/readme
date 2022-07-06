/*$Id: navigation.js,v 2030:c5f590d454a5 2011/07/19 10:33:16 prashantd $*/
var navTimer;
var navTop;
var navMoreUL;
var navMoreLI;
var navFirstOffset = {};
var navFirstElement;
var navOffsetParent;
var childPage;
var same =0;
var touch=false;
var ofwParent;
var smListeners = [];
var smTransitionProp=[];
var navPositionFixed=false,iconMenu=false;
var bFlg=false;
var uagent = navigator.userAgent;
var navAlignHor = true;
if(uagent.indexOf("iPhone")!=-1||uagent.indexOf("iPad")!=-1||uagent.indexOf("Mobile Safari")!=-1||uagent.indexOf("Nokia")!=-1|| uagent.indexOf("Fennec")!=-1||  uagent.indexOf("Opera Mini")!=-1||uagent.indexOf("IEMobile")!=-1)
    touch=true;
    var mobile =!!(uagent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i));


navOffset = function (el) {
    var curleft = 0, curtop = 0;
    if (el.offsetParent) {
        curleft = el.offsetLeft;
        curtop = el.offsetTop;
        while ((el = el.offsetParent) && (el!=navOffsetParent)) {
            curleft += el.offsetLeft;
            curtop += el.offsetTop;
        }
    }
    var n = {
        left:curleft,
        top:curtop
    };
    return n;
}

navOffsetBody = function (el) {
    var curleft = 0, curtop = 0;
    if (el.offsetParent) {
        curleft = el.offsetLeft;
        curtop = el.offsetTop;
        while ((el = el.offsetParent)) {
            curleft += el.offsetLeft;
            curtop += el.offsetTop;
            if(el==navOffsetParent){
                break;
            }
        }
    }
    var n = {
        left:curleft,
        top:curtop
    };
    return n;
}

navOffsetNavigation = function (el) {
    var navDiv = document.getElementById("navigation");
    var childPage = document.getElementById("navigation");
    var curleft = 0, curtop = 0;
    if (el.offsetParent) {
        curleft = el.offsetLeft;
        curtop = el.offsetTop;
        if(el==childPage){
            el = navDiv;
        }
        while ((el = el.offsetParent) && (el!=navDiv)) {
            if(el.id=="childPage"){
                el = navDiv;
            }
            if(el.id!="navigation"){
                curleft += el.offsetLeft;
                curtop += el.offsetTop;
            }else{
                break;
            }
        }
    }
    var n = {
        left:curleft,
        top:curtop
    };
    return n;
}

navOffsetChildParentPage = function (el) {
    var navDiv = document.getElementById("childPageParent");
    var childPage = document.getElementById("navigation");
    var curleft = 0, curtop = 0;
    if (el.offsetParent) {
        curleft = el.offsetLeft;
        curtop = el.offsetTop;
        if(el==childPage){
            el = navDiv;
        }
        while ((el = el.offsetParent) && (el!=navDiv)) {
            if(el.id=="childPageParent"){
                el = navDiv;
            }
            if(el.id!="navigation"){
                curleft += el.offsetLeft;
                curtop += el.offsetTop;
            }else{
                break;
            }
        }
    }
    var n = {
        left:curleft,
        top:curtop
    };
    return n;
}


navGetStyle = function(el,prop) {
    var val;
    if(window.getComputedStyle) {
        var cmpstyle = window.getComputedStyle(el,'')
        val = cmpstyle.getPropertyValue(prop); //NO I18N
    }else if(el.currentStyle) {
        if(prop == 'float') prop='styleFloat'
        prop = prop.replace(/\-(\w)/g,function(s, l) {
            return l.toUpperCase();
        })
        val = el.currentStyle[prop];
    }
    return val;
}

var trans = false;
fnCheckTransition = function(){
    if(!window.ZS_PublishMode && !window.ZS_PreviewMode){navTop.setAttribute("data-transition",false);return;}
    var styleLen = document.styleSheets.length;
    var styleSheet;
    for(i=0;i<styleLen;i++){
        if(document.styleSheets[i].href !==null &&( document.styleSheets[i].href.indexOf("/theme/style.css")!==-1||document.styleSheets[i].href.indexOf("/templates/")!==-1||document.styleSheets[i].href.indexOf("/internalTemplates/")!==-1)){
            styleSheet = document.styleSheets[i];
            break;
        }
    }
    var rules = styleSheet.rules ? styleSheet.rules : styleSheet.cssRules;
    var rulLen = rules.length;
    for(i=0;i<rulLen;i++){
        if(rules[i].selectorText===".submenu"){
            var tr = rules[i].style.transition;
            if(tr!==""){
                trans=true;
            }
            break;
        }
    }
    navTop.setAttribute("data-transition",trans);
}

fnRemoveSubmenuOver = function(){
    var styleLen = document.styleSheets.length;
    var styleSheet;
    for(i=0;i<styleLen;i++){
        if(document.styleSheets[i].href !==null &&( document.styleSheets[i].href.indexOf("/theme/style.css")!==-1)){
            styleSheet = document.styleSheets[i];
            break;
        }
    }
    var rules = styleSheet.rules ? styleSheet.rules : styleSheet.cssRules;
    var rulLen = rules.length;
    for(i=0;i<rulLen;i++){
        if(rules[i].selectorText===".submenu li a:hover"){
            var text = rules[i].cssText;
            var classValue = text.substring(text.indexOf("{"),text.indexOf("}")+1);
            styleSheet.removeRule(i);
            styleSheet.insertRule(".submenu li.selected a"+classValue,i);// No I18N
            break;
        }
    }
}

navGetClassProp= function(el,prop) {
    var val;
    if(el.currentStyle) {
        if(prop === 'float') {
            prop='styleFloat';//No I18N
        }
        prop = prop.replace(/\-(\w)/g,function(s, l) {
            return l.toUpperCase();
        })
        val = (el.currentStyle[prop]) ? el.currentStyle[prop] : "";
    }else if(window.getComputedStyle) {
        var cmpstyle = window.getComputedStyle(el,'')
        val = cmpstyle[prop]; //NO I18N
    }
    return val;
}

navGetOffsetParent = function(el){
    do {
        el = el.offsetParent;
        if(el) {
            var tn = el.tagName.toLowerCase();
            if(tn == 'body' || tn == 'html') break;
            if(navGetStyle(el,'position') != 'static') break;
        }
    }while(el)
    return el;
}
navEventInside = function(el,ev) {
    var rt = ev.relatedTarget||((ev.type == 'mouseover')?ev.fromElement:ev.toElement);
    if(!rt)return false;
    var p=rt;
    do{
        if(p==el)return true;
    }while(p=p.parentNode) 
    return false;
}

var adjustMoreTimer,adjustMoreTimerCount;
navAppendChildPage = function(){
    childPage = document.getElementById("childPageParent");
    
    var topNode = document.getElementById("navigation").parentNode;//No I18N
    while (topNode!=navOffsetParent){
        var ofwProp = navGetStyle(topNode,'overflow');//No I18N
        if(ofwProp=="hidden"){
            ofwParent = topNode;
        }
        var posProp = navGetStyle(topNode,'position');//No I18N
        if(posProp=="fixed"){
            navPositionFixed = true;
        }
        topNode = topNode.parentNode; 
    }
    
    if(ofwParent){
        ofwParent.parentNode.insertBefore(childPage, ofwParent);
    }else{
    
        var navElement = document.getElementById("navigation").parentNode;//No I18N
        var p = navElement;
        var sibli = document.getElementById("navigation");
        if(sibli){
            p.insertBefore(childPage,sibli);
        }else{
            p.appendChild(childPage);
        }
        ofwParent= childPage.parentNode;
    }
}
navSetSMValues = function(){
    var submenus;
    if(document.quertSelectorAll){
        submenus = childPage.querySelectorAll(".submenu");//No I18N
    } else{
        submenus = fnGetDocumentElements_IEfix("div", "class", "submenu", childPage);//No I18N
    }
    if(submenus.length!==0){
        smTransitionProp = navGetClassProp(submenus[0],'transitionProperty');//No I18N
        if(!smTransitionProp) {
            smTransitionProp = navGetClassProp(submenus[0],'WebkitTransitionProperty');//No I18N
        }
        for(i=0;i<submenus.length;i++){
            var el = submenus[i];
            var elf = document.getElementById(el.id.replace("submenu","smframe"));
            fnSetSMValues(el,elf); 
            el.style.display = "none";//No I18N
            elf.style.display = "none";//No I18N
        }
    }
}

navActivate = function(){
    var moreSub,iframeMore;
    navTop = document.getElementById('nav-top');
    if(navTop.children[0].id && navTop.children[0].id=="nav-li1234"){
        iconMenu=true;
    }
    navOffsetParent = document.getElementById("zppages");//No I18N
    if(!navOffsetParent){
        navOffsetParent = document.body;
    }
    if(!document.getElementById("childPageParent")){
        childPage = document.createElement('div');
        childPage.id = "childPageParent";
        childPage.style.position = "relative";
        childPageDiv = document.createElement('div');
        childPageDiv.id = "childPage";
        childPage.appendChild(childPageDiv);
        navOffsetParent.appendChild(childPage);
    }    
    navAppendChildPage();
    fnCheckTransition();
    if(touch){
        fnRemoveSubmenuOver();
    }
    var transAvailable = navTop.getAttribute("data-transition");
    if(transAvailable==="true"){
        navSetSMValues();
    }
    if(navTop.getAttribute("data-navorientation").toLowerCase()=="vertical"){
        //menu is vertical
        navAlignHor=false;
        var ulss = navTop.getElementsByTagName("ul");
        navAlignUlLi(ulss);
        navAddEventHandler(navTop);
        ulss = childPage.getElementsByTagName("ul");
        navAlignUlLi(ulss);
        navAddEventHandler(navTop);
        if(!(typeof(responsiveTheme)!="undefined" && responsiveTheme==true &&mobile)){
            navSetClassNames();
            return;
        }
    }
    navSetClassNames();
    var tempNav = document.createElement('div');
    var tempUl = document.createElement('ul');
    var navMore=document.getElementById("nav-ulMore");
    if(navMore){
        var childNodes=navMore.childNodes;
        var childLength=childNodes.length;
        for(var l=0;l<childLength;l++){
            navTop.insertBefore(childNodes[0],navTop.lastChild);
        }
    }
    var firstList = [];
    var listLis = navTop.childNodes;
    var i,j;
    for(i=0,j=0;i<listLis.length;i++){
        if(listLis[i].tagName=="LI"){
            firstList[j]=listLis[i];
            j++;
        }
    }
    if(firstList.length>1){
        var ff=navOffset(firstList[0]);
        var ss=navOffset(firstList[1]);
        if(ff.top!=ss.top){
            setTimeout(function(){
                navActivate()
            },500);
            return;
        }
    }
    for(var x=0;x<firstList.length;x++){
        tempUl.appendChild(firstList[x]);
    }
    tempNav.appendChild(tempUl);
    var len = tempUl.childNodes.length;
    var moreMenu=document.getElementById("nav-submenu-idMore");
    if(moreMenu==null){
        moreSub = document.createElement("div");
        moreSub.id="nav-submenu-idMore";
        moreSub.className="submenu";
        moreSub.style.display='none';
        moreSub.style.zIndex='201';
        moreSub.style.top="0px";
        moreSub.style.overflow="hidden";

        iframeMore = document.createElement('iframe');
        iframeMore.style.display='none';
        iframeMore.style.position='absolute';
        iframeMore.style.zIndex='200';
        iframeMore.id = "nav-smframe-idMore";
        iframeMore.src="/html/blank";
        iframeMore.setAttribute("scrolling","no");
        iframeMore.setAttribute("frameborder","0");
        iframeMore.style.filter="alpha(opacity=0)";
        navMoreUL = document.createElement('ul');
        navMoreUL.id="nav-ulMore";
        navMoreUL.setAttribute("navparent","nav-liMore");
        navMoreLI = document.createElement('li');
        navMoreLI.id="nav-liMore";
        navMoreLI.className=" navArrow";
        navMoreLI.setAttribute("navsub","nav-ulMore");
    }else{
        moreSub=document.getElementById("nav-submenu-idMore");
        iframeMore=document.getElementById("nav-smframe-idMore");
    }
    for(var k=0;k<len;k++){
        var uls = tempUl.childNodes[0].getElementsByTagName("ul");
        navAlignUlLi(uls);
        var elem = tempUl.childNodes[0];
        navTop.appendChild(tempUl.childNodes[0]);
        if(k==0){
            navFirstOffset.left = navOffset(elem).left;
            navFirstOffset.top = navOffset(elem).top;
            navFirstElement = elem;
        }else if(k==1){
            navSecondElement=elem;
        }
        var realTop=navOffset(elem);
        if((((navFirstOffset.top != realTop.top || navFirstElement.offsetTop != elem.offsetTop)&&navTop.getAttribute("data-navorientation").toLowerCase()!="vertical")||(window.innerWidth<=640 && (typeof(responsiveTheme)!="undefined" && responsiveTheme==true))||(window.ZS_PreviewMode && parent.responsivePreview=="true"))){
            var mMenu=false;
            var span=navMoreLI.getElementsByTagName("span")[0];
            if(k<=2){
                if(navFirstElement){
                    navMoreUL.appendChild(navFirstElement);
                }else if(navSecondElement){
                    navMoreUL.appendChild(navSecondElement);
                }
                mMenu=true;
                if(span){
                    span.innerHTML="&#x2261; Menu";//No I18N
                    navMoreLI.className="navArrow selected";
                }
            }else{
                if(span){
                    span.innerHTML="More";//No I18N
                    if(navMoreLI.className.indexOf("selected")!=-1){
                        navMoreLI.className=navMoreLI.className.replace("selected","");
                    }
                }
            }
            navMoreUL.appendChild(elem);
            for(x=0;x<tempUl.childNodes.length;){
                navMoreUL.appendChild(tempUl.childNodes[0]);
            }
            break;
        }
    }
    if(navMoreUL.childNodes.length!=0){
        var childPageApd = document.getElementById("childPage");
        moreSub.appendChild(navMoreUL);
        childPageApd.appendChild(moreSub);
        childPageApd.appendChild(iframeMore);
        if(moreMenu==null){
            var spanMore = document.createElement('span');
            var liA = document.createElement('a');
            if(mMenu==true){
                spanMore.innerHTML="&#x2261; Menu";//No I18N
                navMoreLI.className=navMoreLI.className+" selected";
            }else{
                spanMore.innerHTML="More";//No I18N
            }
            var emMore = document.createElement('em');
            liA.appendChild(spanMore);
            liA.appendChild(emMore);
            navMoreLI.appendChild(liA);
        }
        navTop.appendChild(navMoreLI);
        
        adjustMoreTimerCount=0;
        if(!mMenu){
            navAdjustMoreTimerFn();
        }
    }
    navAddEventHandler(navTop);
    var childPageUls = childPage.getElementsByTagName("ul");
    navAlignUlLi(childPageUls);
    navAddEventHandler(childPage);
    if(mobile){
        childPage.style.width ="100%";
        document.getElementsByTagName("html")[0].onclick= navDisable;
        document.getElementsByTagName("html")[0].ontouchstart= navDisable;
    }
}
navAdjustMore = function(){
    var liTop = navOffset(navMoreLI);
    navFirstOffset.left = navOffset(navFirstElement).left;
    navFirstOffset.top = navOffset(navFirstElement).top;
    while(navFirstOffset.top!=liTop.top){
        navTop.removeChild(navMoreLI);
        navMoreUL.insertBefore(navTop.lastChild,navMoreUL.firstChild);
        navTop.appendChild(navMoreLI);
        var ulsubs = navMoreLI.parentNode.getElementsByTagName("ul");
        navAlignUlLi(ulsubs,ulsubs.parentNode);
        liTop = navOffset(navMoreLI);
        navFirstOffset.top=navOffset(navTop.children[0]).top;
    }
}
navAdjustMoreTimerFn = function(){
    if(adjustMoreTimer) clearTimeout(adjustMoreTimer);
    navAdjustMore();
    adjustMoreTimerCount++;
    if(adjustMoreTimerCount < 60 ) {
        adjustMoreTimer = setTimeout(navAdjustMoreTimerFn,1000)
    }
}
navId = function(el) {
    var undefined;
    if(el.id == undefined || el.id == "")el.id="nav-id"+(Math.random()*11111111111111111111);
}

navAlignUlLi = function(uls,liLL){
    var auls=[]
    var li;
    for(var i=0;ul=uls[i];i++) {
        auls[i]=ul;
        li = ul.parentNode;
        if(li.getElementsByTagName('li')[0]){
            if(ul.id=="")navId(ul);
            if(li.id=="")navId(li);
            if(ul.id===""){ul.setAttribute("navparent",li.id);}
            if(li.id===""){li.setAttribute("navsub",ul.id);}
            if(liLL==undefined){
                navAddEventHandler(ul);
            }else{
                liLL.onmouseover = navItemMouseOver;
                liLL.onmouseout = navItemMouseOut;
                liLL.ontouchstart = navItemTouch;
            }
            ul.onmouseover = navMouseOver;
            ul.onmouseout = navMouseOut;
            ul.ontouchstart = navTouch;
        }
    }
    var childPageInner = document.getElementById("childPage");
    for(var i=0;ul=auls[i];i++) {
        var sm,smf;
        if(ul.id.indexOf("nav-ul")!=-1){break;}
        if(document.getElementById(ul.id.replace(/nav\-/,'nav-submenu-')))
            sm = document.getElementById(ul.id.replace(/nav\-/,'nav-submenu-'));
        else
            sm = document.createElement('div');
        sm.className = 'submenu';
        sm.style.zIndex='201';
        sm.appendChild(ul);
        sm.id = ul.id.replace(/nav\-/,'nav-submenu-');
        childPageInner.appendChild(sm);
        if(document.getElementById(ul.id.replace(/nav\-/,'nav-smframe-')))
            smf = document.getElementById(ul.id.replace(/nav\-/,'nav-smframe-'));
        else
            smf = document.createElement('iframe');
        smf.style.display='none';
        smf.style.position='absolute';
        smf.style.zIndex='200';
        smf.id = ul.id.replace(/nav\-/,'nav-smframe-');
        smf.src="/html/blank";
        smf.setAttribute("scrolling","no");
        smf.setAttribute("frameborder","0");
        sm.style.display='none';
        smf.style.filter="alpha(opacity=0)";
        childPageInner.appendChild(smf);
    }
    document.getElementsByTagName("html")[0].ontouchstart= fnMouseOut;
}

navAddEventHandler = function(ul) {
    var lis = ul.childNodes;
    var i,li;
    for(var i=0;li=lis[i];i++) {
        if(li.tagName=="LI" || li.tagName=="li") {
            li.onmouseover = navItemMouseOver;
            li.onmouseout = navItemMouseOut;
            li.ontouchstart = navItemTouch;
            li.onmouseclick= navItemMouseEnter;
        }
    }
    
}

navMenuAlign = function(curr,sm){
    var bdHeight = navOffsetParent.offsetHeight;
    var thisPos = navOffset(curr).top;
    var toShowHeight = thisPos+curr.offsetHeight+sm.offsetHeight;
    var childPageParentDiv = document.getElementById("childPageParent");
    var orient = childPageParentDiv.getAttribute("data-sm-orientation");
    if(orient!="" && orient!="bottom" &&orient!="top"){
        if(((bdHeight-toShowHeight)<sm.offsetHeight && thisPos>(bdHeight/2)) || window.innerHeight==(thisPos+curr.offsetHeight)){//|| thisPos == 0){
            orient="bottom";//No I18N 
        }else{
            orient="top";//No I18N
        }
    }
    
    
    childPageParentDiv.setAttribute("data-sm-orientation",orient);
    
    var navigationLeft = navOffset(sm).left;
    var navigationRight;
    navigationRight=window.innerWidth-navigationLeft;
    if(navigationLeft>navigationRight){
        orient+="Right";//No I18N
    }else{
        orient+="Left";//No I18N
    }
    return orient;
}

navSetClassNames = function(){
    var lis = navTop.getElementsByTagName("li");
    for(var i=0;li=lis[i];i++){
        if(li.getAttribute('navsub') != null)
            li.className = li.className+" navArrow";
    }
    lis = childPage.getElementsByTagName("li");
    for(i=0;li=lis[i];i++){
        if(li.getAttribute('navsub') != null)
            li.className = li.className+" navArrow";
    }
    
}

navItemTouch = function(ev){
    stopPropagation(ev);
    if(this.tagName &&((this.tagName.toLowerCase()=="ul" && (!this.getAttribute("navshowing") != null))||(this.tagName.toLowerCase()=="li" && (!this.parentNode.getAttribute("navshowing") != null)))){
        if(this.tagName.toLowerCase()==="li" && this.getAttribute("navsub") !== null && this.className.indexOf("active") === -1){
            preventDefault(ev);
        }
        if(window.innerWidth<700){
            navMobileShowMenu.call(this,ev);
        }else{
            navShowMenu.call(this,ev);
        }
    }
}
navTouch =function(ev){
    if(navTimer)clearTimeout(navTimer);
}

navItemMouseOver = function(ev) {
    ev=ev||window.event;
    if(navEventInside(this,ev))return;
    navItemMouseEnter.call(this,ev);
}
navItemMouseOut = function(ev) {
    ev=ev||window.event;
    if(navEventInside(this,ev))return;
    navItemMouseLeave.call(this,ev);
}
navMouseOver = function(ev) {
    ev=ev||window.event;
    if(navEventInside(this,ev))return;
    navMouseEnter.call(this,ev);
}
navMouseOut = function(ev) {
    ev=ev||window.event;
    if(navEventInside(this,ev))return;
    navMouseLeave.call(this,ev);
}
navItemMouseEnter = function(ev) {
        if(window.innerWidth<700){
            navMobileShowMenu.call(this,ev);
        }else{
            navShowMenu.call(this,ev);
        }
}
navItemMouseLeave = function(ev) {
    var el = this;
    if(navTimer)clearTimeout(navTimer);
    navTimer = setTimeout(function(){
        navHideMenu(el.parentNode)
    },500);
}
navMouseEnter = function(ev) {
    var el = this;
    if(navTimer)clearTimeout(navTimer)
}
navMouseLeave = function(ev) {
    var el = this;
    if(navTimer)clearTimeout(navTimer)
    navTimer = setTimeout(function(){
        navHideSelf(el)
    },500);
}

fnSetSMValues = function(sm,smf){
    var ulElem = getFirstChild(sm);
    
    var dummy = document.createElement("div");
    dummy.id="dummyForTransition";
    dummy.style.display="block";
    dummy.style.left="-4000px";
    var dum = sm.cloneNode(true);
    dum.style.height='';
    //dum.style.width='';
    dummy.appendChild(dum);
    navOffsetParent.appendChild(dummy);
    
    /*if(smTransitionProp.indexOf("height")>-1){
        sm.style.height='0px';
        smf.style.height='0px';
    }
    if(smTransitionProp.indexOf("width")>-1){
        sm.style.width='0px';
        smf.style.width='0px';
    }
    if(smTransitionProp.indexOf("top")>-1){
        sm.style.top='0px';
        smf.style.top='0px';
    }
    /*if(smTransitionProp.indexOf("opacity")>-1){
        ulElem.style.opacity='0';
        sm.style.opacity='0';
        smf.style.opacity='0';
    }*/
    
    var smOffHei = dum.offsetHeight;
    var smOffWid = dum.offsetWidth;
    //var smOffTop = 0-dum.offsetHeight;
    var smOffOpa = 1;
    if(smTransitionProp.indexOf("height")>-1){
        sm.setAttribute("data-height",smOffHei+"px");
        ulElem.setAttribute("data-height",smOffHei+"px");
        smf.setAttribute("data-height",smOffHei+"px");
    }
    if(smTransitionProp.indexOf("width")>-1){
        sm.setAttribute("data-width",smOffWid+"px");
        ulElem.setAttribute("data-width",smOffWid+"px");
        smf.setAttribute("data-width",smOffWid+"px");
    }
    /*if(smTransitionProp.indexOf("top")>-1){
        sm.setAttribute("data-top",smOffTop+"px");
        ulElem.setAttribute("data-top",smOffTop+"px");
        smf.setAttribute("data-top",smOffTop+"px");
    }*/
    if(smTransitionProp.indexOf("opacity")>-1){
        sm.setAttribute("data-opacity",1);
        ulElem.setAttribute("data-opacity",1);
        smf.setAttribute("data-opacity",1);
    }
    dum.parentNode.parentNode.removeChild(dummy);
    //var data = {height:smOffHei+"px",width:smOffWid+"px",top:smOffTop+"px",opacity:smOffOpa};
    var data = {height:smOffHei+"px",width:smOffWid+"px",opacity:smOffOpa};//No I18N
    return data;
}

navShowMenu = function(event) {

    if(navTimer)clearTimeout(navTimer)
    navHideMenu(this.parentNode);
    var subId = this.getAttribute('navsub');
    if(!subId)return;
    subId = subId.replace("ul","id");
    //var pxls=this.parentNode.hasAttribute("navparent")?5:0;
    var sm =  document.getElementById(subId.replace(/nav\-/,'nav-submenu-'));
    var smf =  document.getElementById(subId.replace(/nav\-/,'nav-smframe-'));
    var off = navOffset(this);
    var flt = navGetStyle(this,'float');//NO I18N
    var zIndexNode;
    var ongoingShowTransit = this.parentNode.parentNode.getAttribute("transit");
    if(ongoingShowTransit && ongoingShowTransit == "show"){
        return;
    }
    if(this.parentNode.getAttribute("navparent") != null){
        zIndexNode = this.parentNode.parentNode;
        var zi = navGetStyle(zIndexNode,'z-index');//No I18N
        sm.style.zIndex=zi-0+1;
    }
    for(i=0;i<smListeners.length;){
        unbindEvent(sm,smListeners[i].type,testhideSM);
        smListeners.splice(i);
    }
    smf.style.display = 'block';
    sm.style.display = 'block';

    var fstChild = getFirstChild(sm);
    var getParentId = fstChild.getAttribute("navparent");
    var getParElem = document.getElementById(getParentId);
    var parElem = document.getElementById(getParElem.parentNode.getAttribute("navparent"));
    if(getParElem.className.indexOf("active")== -1)
        getParElem.className+=" active";
    
    var diffTop = navOffset(this);
    var diff = document.getElementById('childPageParent');
    var offsetChildPage = navOffset(diff);
    
    if(navTop.getAttribute("data-navorientation").toLowerCase()!="vertical"){
        var offsetToNavigation = navOffsetNavigation(this);
        
        if(flt!='none'){
            smf.style.left = sm.style.left = offsetToNavigation.left-offsetChildPage.left+ 'px';
        }else{
            if((off.left+sm.offsetWidth+this.offsetWidth)>document.body.clientWidth||(parElem && navOffset(parElem).left>off.left)&&(off.left>this.offsetWidth))         {
                sm.style.left=smf.style.left=(offsetToNavigation.left-this.offsetWidth-offsetChildPage.left )+'px';
            }else{
                sm.style.left=smf.style.left=(offsetToNavigation.left+this.offsetWidth-offsetChildPage.left )+'px';
            }
        }
        var smPos = navMenuAlign(this,sm);
        
        var dummy = document.createElement("div");
        dummy.id="dummyForTransition";
        dummy.style.display="block";
        dummy.style.left="-4000px";
        var dum = sm.cloneNode(true);
        dum.style.height='';
        dummy.appendChild(dum);
        navOffsetParent.appendChild(dummy);
        var smOffHei = dum.offsetHeight;
        dum.parentNode.parentNode.removeChild(dummy);
        
        switch(smPos){
            case "bottomRight"://No I18N
            case "bottomLeft"://No I18N
                if(offsetChildPage.top==diffTop.top){
                    smf.style.top = sm.style.top = 0-smOffHei+'px';
                }else{
                    var offsetToChildPage = navOffsetChildParentPage(this);
                    smf.style.top = sm.style.top = (offsetToChildPage.top+this.offsetHeight-smOffHei)+'px';
                }
                break;
            default:
                if(flt!='none'){
                    smf.style.top = sm.style.top = (diffTop.top-offsetChildPage.top+this.offsetHeight)+'px';
                }else{
                    smf.style.top = sm.style.top = this.parentNode.parentNode.offsetTop+this.offsetTop+'px';
                }
                break;
        }
    }else{
        var smWidth = sm.offsetWidth;
        var dataWidth = sm.getAttribute("data-width");
        if(dataWidth){
            smWidth = parseInt(dataWidth.replace("px",""));
        }
        smf.style.top = sm.style.top = diffTop.top-offsetChildPage.top+'px';
        if((diffTop.left+this.offsetWidth+smWidth)>window.innerWidth){
            sm.style.left=smf.style.left=diffTop.left-offsetChildPage.left-this.offsetWidth+'px';
        }else{
            sm.style.left=smf.style.left=diffTop.left-offsetChildPage.left+this.offsetWidth+'px';
        }
        if( this.parentNode.id == 'nav-top' && mobile==true){
                sm.style.left = "100%";
                var np;
                if(!navAlignHor && this.parentNode.id == 'nav-top'){
                        np = this.parentNode;
                }
                else{
                        np = getParElem.parentNode.parentNode;
                }
                np.style.position="relative";
                navMobileShowMenu.call(this,event);
        }
    }
    
    var transAvailable = navTop.getAttribute("data-transition");
    if(transAvailable=="true"){
        if(sm.getAttribute("hiding-interval")){
            clearInterval(sm.getAttribute("hiding-interval"));
            sm.setAttribute("hiding-counter",0);
        }
        sm.setAttribute("transit","show");
        var smTransitionDuration = navGetClassProp(sm,"transitionDuration");//NO I18N
        if(!smTransitionDuration){
            smTransitionDuration = navGetClassProp(sm,"WebkitTransitionDuration");//NO I18N
        }
        smTransitionDuration = parseFloat(smTransitionDuration);
        smTransitionProp = navGetClassProp(sm,'transitionProperty');//No I18N
        if(!smTransitionProp) {
            smTransitionProp = navGetClassProp(sm,'WebkitTransitionProperty');//No I18N
        }
        var ulElem = getFirstChild(sm);
        if(smTransitionProp.indexOf("top")>-1){
            var dataTop = sm.getAttribute("data-top");
            if(dataTop=="" || dataTop==null){
                dataTop= sm.style.top;
                ulElem.style.top="0px";
                sm.style.top="0px";
                smf.style.top="0px";
                sm.setAttribute("data-top",dataTop);
                ulElem.setAttribute("data-top",dataTop);
                smf.setAttribute("data-top",dataTop);
            }
            ulElem.style.top=dataTop;
            sm.style.top=dataTop;
            smf.style.top=dataTop;
        }
        if(smTransitionProp.indexOf("left")>-1){
            var dataLeft = sm.getAttribute("data-left");
            if(dataLeft=="" || dataLeft==null){
                dataLeft = sm.style.left;
                ulElem.style.left="0px";
                sm.style.left="0px";
                smf.style.left="0px";
                sm.setAttribute("data-left",dataLeft);
                ulElem.setAttribute("data-left",dataLeft);
                smf.setAttribute("data-left",dataLeft);
            }
            ulElem.style.left=dataLeft;
            sm.style.left=dataLeft;
            smf.style.left=dataLeft;
        }
        if(smTransitionProp.indexOf("height")>-1){
            var dataHeight = sm.getAttribute("data-height");
            if(dataHeight=="" || dataHeight==null){
                var dataObj=fnSetSMValues(sm,smf);
                dataHeight=dataObj.height;
            }
            ulElem.style.height=dataHeight;
            sm.style.height=dataHeight;
            smf.style.height=dataHeight;
        }
    
        if(smTransitionProp.indexOf("width")>-1){
            var dataWidth = sm.getAttribute("data-width");
            if(dataWidth=="" || dataWidth==null){
                var dataObj=fnSetSMValues(sm,smf);
                dataWidth=dataObj.width;
            }
            ulElem.style.width=dataWidth;
            sm.style.width=dataWidth;
            smf.style.width=dataWidth;
        }
        if(smTransitionProp.indexOf("opacity")>-1){
            var dataOpacity = sm.getAttribute("data-opacity");
            if(dataOpacity=="" || dataOpacity==null){
                var dataObj=fnSetSMValues(sm,smf);
                aa = navGetClassProp(sm,'opacity');//No I18N
                dataOpacity=dataObj.opacity;
            }
            ulElem.style.opacity=dataOpacity;
            sm.style.opacity=dataOpacity;
            smf.style.opacity=dataOpacity;
        }
        var support = transSupportNav();
        if(support.transitionEnd){
            bindEvent(sm,support.transitionEnd,resetAttr);
            setTimeout(function(){
                if(sm.getAttribute("transit") == "show"){
                    resetAttr(null,sm);
                }else{
                    return;
                }
            },smTransitionDuration*1000);
        }
    }
    this.parentNode.setAttribute("navshowing",this.id);
}

resetAttr = function(e,resetSm){
    var sm;
    if(resetSm){
        sm = resetSm;
    }else{
        sm = e.currentTarget;
    }
    sm.setAttribute("transit","none");
    unbindEvent(sm,"transitionend",resetAttr);//NO I18N
}

navMenuBtm = function(curr){
   
    var navigationTop = navOffset(curr).top;
    var navigationBottom;
    navigationBottom=window.innerHeight-navigationTop;
    return navigationBottom;
}

navHideSelf = function(ul) {
    var sm = ul.parentNode;
    if(sm.className.indexOf('submenu')!=-1) {
        smf = document.getElementById(sm.id.replace(/nav\-submenu/,'nav-smframe'));
        var transAvailable = navTop.getAttribute("data-transition");
        if(transAvailable=="true"){
            sm.setAttribute("transit","hide");
            var support = transSupportNav();
            var smTransitionDuration = navGetClassProp(sm,"transitionDuration");//NO I18N
            if(!smTransitionDuration){
                smTransitionDuration = navGetClassProp(sm,"WebkitTransitionDuration");//NO I18N
            }
            smTransitionDuration = parseFloat(smTransitionDuration);
            if(support.transitionEnd){
                if(smTransitionProp.indexOf("height")>-1 && !mobile ){
                    sm.style.height="0px";
                    smf.style.height="0px";
                }
                if(smTransitionProp.indexOf("width")>-1){
                    sm.style.width="0px";
                    smf.style.width="0px";
                }
                if(smTransitionProp.indexOf("opacity")>-1){
                    sm.style.opacity="0";
                    smf.style.opacity="0";
                }
                if(smTransitionProp.indexOf("top")>-1){
                    sm.style.top="0px";
                    smf.style.top="0px";
                }
                if(smTransitionProp.indexOf("left")>-1){
                    sm.style.left="0px";
                    smf.style.left="0px";
                }
                var abc= {
                    element:sm,
                    type:support.transitionEnd,
                    handler:testhideSM
                };
                smListeners.push(abc);
                bindEvent(sm,support.transitionEnd,testhideSM);
                clearInterval(sm.getAttribute("hiding-interval"));
                var hiding_interval = setInterval(function(){
                    check_transitionend(sm);
                },smTransitionDuration*100);
                sm.setAttribute("hiding-counter",0);
                sm.setAttribute("hiding-interval",hiding_interval);
            }else{
                sm.style.display = 'none';
                smf.style.display = 'none';
            }
            setTimeout(function(){
                navHideMenu(ul);
            },500);
        }else{
         sm.style.display="none";
         navHideMenu(ul);
        }
    }
    var navparent = ul.getAttribute('navparent');
    if(navparent && navparent != '') {
        var par = document.getElementById(navparent);
        if(par){
            var el;
            if(par.tagName=="ul" || par.tagName=="UL"){
                el= par;
            }else{
                el= par.parentNode;
            }
             
            if(par.className.indexOf("active")!= -1)
                par.className = par.className.replace("active","");
            if(navTimer)clearTimeout(navTimer)
            navTimer = setTimeout(function(){
                navHideSelf(el)
            },500);
        }
    }
}

testhideSM = function(ab,resetSm){
    var sm;
    if(resetSm){
        sm = resetSm;
    }else{
        sm = ab.currentTarget;
    }
    sm.style.display="none";
    var smf =  document.getElementById(sm.id.replace('nav-submenu-','nav-smframe-'));
    smf.style.display="none";
    sm.setAttribute("transit","none");
    unbindEvent(sm,"transitionend",arguments.callee);//No I18N
}

navHideMenu = function(ul) {
    if(ul && ul.id.indexOf("nav-submenu-")!=-1){
        ul = getFirstChild(ul);
       
    }
    if(ul && ul.getAttribute('navshowing')){
        var showingId = ul.getAttribute('navshowing');
        if(showingId && document.getElementById(showingId)){
            var subId = document.getElementById(showingId).getAttribute('navsub');
            var submenu = document.getElementById(subId);
            subId = subId.replace("ul","id");
            var sm =  document.getElementById(subId.replace(/nav\-/,'nav-submenu-'));
            var smf =  document.getElementById(subId.replace(/nav\-/,'nav-smframe-'));
            navHideMenu(submenu);
            var fstChild = getFirstChild(sm);
            var getParentId = fstChild.getAttribute("navparent");
            var getParElem = document.getElementById(getParentId);
            if(getParElem.className.indexOf("active")!= -1)
                getParElem.className = getParElem.className.replace("active","");
            ul.removeAttribute('navshowing');
            var transAvailable = navTop.getAttribute("data-transition");
            if(transAvailable=="true"){
                sm.setAttribute("transit","hide");
                var support = transSupportNav();
                var smTransitionDuration = navGetClassProp(sm,"transitionDuration");//NO I18N
                if(!smTransitionDuration){
                    smTransitionDuration = navGetClassProp(sm,"WebkitTransitionDuration");//NO I18N
                }
                smTransitionDuration = parseFloat(smTransitionDuration);
                if(support.transitionEnd){
                    if(smTransitionProp.indexOf("height")>-1 && !(typeof(parent.responsivePreview)!="undefined" && parent.responsivePreview=="true")){
                        sm.style.height="0px";
                        smf.style.height="0px";
                    }
                    if(smTransitionProp.indexOf("width")>-1){
                        sm.style.width="0px";
                        smf.style.width="0px";
                    }
                    if(smTransitionProp.indexOf("top")>-1){
                        sm.style.top="0px";
                        smf.style.top="0px";
                    }
                    if(smTransitionProp.indexOf("left")>-1){
                        sm.style.left="0px";
                        smf.style.left="0px";
                    }
                    if(smTransitionProp.indexOf("opacity")>-1){
                        sm.style.opacity="0";
                        smf.style.opacity="0";
                    }
                    var abc= {
                        element:sm,
                        type:support.transitionEnd,
                        handler:testhideSM
                    };
                    smListeners.push(abc);
                    bindEvent(sm,support.transitionEnd,testhideSM);
                    clearInterval(sm.getAttribute("hiding-interval"));
                    var hiding_interval = setInterval(function(){
                        check_transitionend(sm);
                    },smTransitionDuration*100);
                    sm.setAttribute("hiding-counter",0);
                    sm.setAttribute("hiding-interval",hiding_interval);
                }else{
                    sm.style.display = 'none';
                    smf.style.display = 'none';
                }
            }else{
                sm.style.display = 'none';
                smf.style.display = 'none';
            }
        }
    }
}

hideSubMenus = function(sm,smf){
    sm.style.display="none";
    smf.style.display="none";
    
}

stopPropagation = function(e){
    if (e.stopPropagation) {
        e.stopPropagation();
    }else {
        e.cancelBubble = true;
    }
}
preventDefault = function(e){
    if(e.preventDefault) {
        e.preventDefault();
    }else {
        e.returnValue = false;
    }
}

fnMouseOut =function(ev){
    stopPropagation(ev);
    var targt = ev.target;
    if(targt && targt.tagName){
        while(targt && targt.tagName && targt.tagName.toLowerCase()!="ul"){
            if(targt.tagName.toLowerCase()=="body"){
                break;
            }else{
                targt = targt.parentNode;
            }
        }
        if(targt && targt.tagName.toLowerCase()=="ul" && (targt.id=="nav-top"|| targt.getAttribute("navparent") != null))
            return;
    }
    var lis = document.getElementsByTagName("li");
    var li,elem;
    for(var i=0;(li=lis[i]);i++){
        if(li.className.indexOf("active")!=-1){
            elem = li;
            break;
        }
    }
    if(elem){
        fnNavHideMenu(elem);
    }
}

fnNavHideMenu = function(elem){
    if(elem.getAttribute('navsub') != null){
        var subId = elem.getAttribute('navsub');
        var submenu = document.getElementById(subId);
        var sm =  document.getElementById(subId.replace(/nav\-/,'nav-submenu-'));
        var smf =  document.getElementById(subId.replace(/nav\-/,'nav-smframe-'));
        if(submenu){
            var lis = submenu.getElementsByTagName("li");
            var li;
            for(var i=0;(li=lis[i]);i++){
                if(li.getAttribute('navsub') != null)
                    fnNavHideMenu(li);
            }
        }
        if(elem.className.indexOf("active")!= -1)
            elem.className = elem.className.replace("active","");
        if(elem.tagName.toLowerCase()=="ul" && elem.getAttribute('navshowing') != null)
            elem.removeAttribute('navshowing');
        else if(elem.tagName.toLowerCase()=="li" && elem.parentNode.getAttribute('navshowing') != null)
            elem.parentNode.removeAttribute('navshowing');
        if(sm){
            sm.style.height="0px";
            sm.style.width="0px";
            sm.style.left="-4000px";
        }
        if(smf){
            smf.style.height="0px";
            smf.style.width="0px";
            smf.style.left="-4000px";
        }
    }else{
        var subId= elem.parentNode.id;
        var sm =  document.getElementById(subId);
        var smf =  document.getElementById(subId.replace('submenu','smframe'));
        if(sm){
            sm.style.height="0px";
            sm.style.width="0px";
            sm.style.left="-4000px";
        }
        if(smf){
            smf.style.height="0px";
            smf.style.width="0px";
            smf.style.left="-4000px";
        }
    }
}

getFirstChild = function(elm){
    for(x=0;x<elm.childNodes.length;x++){
        firstChild=elm.childNodes[x];
        if(firstChild.nodeType!=3){
            break;
        }        
    }
    return firstChild;
}

setTimeout(function(){
    if(window.ZS_PublishMode && !window.ZS_PreviewMode){
        var userView = getCookie('userView');// No I18N
        if(userView == 'web'){
            var mobile;
            var userAgent = navigator.userAgent;
            mobile =!!(userAgent.match(/(iPhone|iPod|blackberry|android 0.5|htc|lg|midp|mmp|mobile|nokia|opera mini|palm|pocket|psp|sgh|smartphone|symbian|treo mini|Playstation Portable|SonyEricsson|Samsung|MobileExplorer|PalmSource|Benq|Windows Phone|Windows Mobile|IEMobile|Windows CE|Nintendo Wii)/i));
            if(document.getElementById('footerBar').style.display!='none'){
                if(document.getElementById('mobileBar') && mobile){
                    document.getElementById('mobileBar').style.display="block";
                }
            }
            else{
                document.getElementById('footerBar').style.display='block'; 
            }
            if(mobile){
                document.getElementById('mobileSite').style.display="block";
            }
        }else{
            delCookie('userView');//No I18N
        }
    }
},1000);//No I18N

fnBindHandleClickEvents = function(){
        var container = document.getElementsByTagName("body");
        var links = container[0].getElementsByTagName("a");
        for(var i =0;link=links[i];i++){
            if(((link.parentNode.parentNode.id!=="nav-top") || (link.parentNode.parentNode.id==="nav-top" && !checkExternalUrl(link.href))) && link.parentNode.parentNode.id.indexOf("nav-ul")===-1 && link.id!=="zpFooterUpgradeLink" && link.id !== "zpBlogNext" && link.id !== "zpBlogPrev" && link.href.search("blogs/feed/") === -1 && link.parentNode.id !=="nav-liMore" && !checkExternalUrl(link.href) && link.href.indexOf("blogs/") === -1){
                bindEvent(link,'click', fnPreviewClickInfoMsg);   //No I18N
                
        }
    }
}

fnPreviewClickInfoMsg=function(e){
    preventDefault(e);
    stopPropagation(e);

    var infoElem = parent.document.getElementById("zpPreviewClickInfoMsg");
    if(infoElem && !bFlg){
        bFlg = true;
        infoElem.style.display="block";
        var msgWid = infoElem.offsetWidth;
        var wwidth = parent.document.documentElement.clientWidth;
        infoElem.style.left=(wwidth/2-msgWid/2)+'px';
        infoElem.style.top='0px';
        infoElem.style.position="absolute";

        var alertContent = infoElem.getElementsByClassName("alertMsgCont")[0].innerHTML;
        var addedURL = this.href;
        if(addedURL){
            var t = document.createElement('a');
            t.href = addedURL;
            var exDomain = t.host;
            var contLen = exDomain.length + 10;

            if(addedURL.length >= contLen) {
                addedURL = addedURL.substring(0, contLen) + " ...";      
            }
        }

        infoElem.getElementsByClassName("alertMsgCont")[0].innerHTML= addedURL?("\""+addedURL+"\" "+alertContent):('Button '+alertContent); // No I18N
        setTimeout(function(){
                infoElem.style.display='none';
                infoElem.getElementsByClassName("alertMsgCont")[0].innerHTML=alertContent;    
                bFlg = false;
                },2000);
    }

    return false;
}



transSupportNav = function(){
     var transitions = {
                'transition':'transitionend',// No I18N
                'OTransition':'oTransitionEnd',// No I18N
                'MSTransition':'msTransitionEnd',// No I18N
                'MozTransition':'transitionend',// No I18N
                'WebkitTransition':'webkitTransitionEnd'// No I18N
     }
     var style = document.body.style || document.documentElement.style;
     for(transition in transitions){
        if(style[transition] != undefined){
            return {transitionEnd:transitions[transition],'transition':transition};
        }
     }
     return {'transitionEnd':undefined};// No I18N
}

bindEvent=function(el,type,func){
    if(el.addEventListener){
        el.addEventListener(type,func,false);
    }else if(el.attachEvent){
        el.attachEvent('on'+type,func);
    }
}
unbindEvent=function(el,type,handler){
    if(handler){
        if(el.removeEventListener){
            el.removeEventListener(type,handler,false);    
        }else if(el.detachEvent){
            el.detachEvent('on'+type,handler);
        }
    }
}

check_transitionend = function(sm){
    var counter = sm.getAttribute("hiding-counter");
    sm.setAttribute("hiding-counter",++counter);
    if(smTransitionProp.indexOf("height")>-1){
        if(sm.style.height == navGetStyle(sm,'height')){
            testhideSM(null,sm);
        }
    }
    if(smTransitionProp.indexOf("width")>-1){
        if(sm.style.width == navGetStyle(sm,'width')){
            testhideSM(null,sm);
        }
    }
    if(smTransitionProp.indexOf("top")>-1){
        if(sm.style.top == navGetStyle(sm,'top')){
            testhideSM(null,sm);
        }
    }
    if(smTransitionProp.indexOf("left")>-1){
        if(sm.style.left == navGetStyle(sm,'left')){
            testhideSM(null,sm);
        }
    }
    if(smTransitionProp.indexOf("opacity")>-1){
        if(sm.style.opacity == navGetStyle(sm,'opacity')){
            testhideSM(null,sm);
        }
    }
    if(sm.getAttribute("hiding-counter") > 12){
        clearInterval(sm.getAttribute("hiding-interval"));
    }
}
navLeftAlign = function(np2,sm2,px){
    try{
    np2.style.left = parseInt(np2.style.left) - px+"%";
    sm2.style.left = parseInt(sm2.style.left) - px+"%";
    if(parseInt(sm2.style.left)<5){
        sm2.style.left ="0%";
        np2.style.left = "-100%";
        if(!(sm2.id=="nav-submenu-idMore")){
            if((np2.id!="navigation" && navAlignHor) ||(!navAlignHor && np2.id!="nav-top")){
                np2.style.display = "none";
            }
        }
        return;
    }
    setTimeout(function(){
        navLeftAlign(np2,sm2,px);
    },25);
    }catch(ex){
    }
}

navRightAlign = function(np2,sm2,px){
    sm2.style.left = parseInt(sm2.style.left)+px+"%";
    np2.style.left = parseInt(np2.style.left)+px+"%";
    if(parseInt(sm2.style.left)>95){
        np2.style.left = "0%";
        sm2.style.left ="100%";
        np2.style.top="0px";
        sm2.style.display = 'none';
        return;
    }
    setTimeout(function(){
        navRightAlign(np2,sm2,px);
    },25);
}

navRightAli = function(pid,sid){
    var smE = document.getElementById(sid);
    if(parseInt(smE.style.left)!=0){
        return;
    }
    var psm = document.getElementById(pid).parentNode.parentNode.id;
    var psmE;
    if(psm == "navigation"){
        psm = "nav-top";// No I18N
    }
    psmE = document.getElementById(psm);
    psmE.style.display = 'block';
    navRightAlign(psmE,smE,10);
}

navMobileHideMenu = function(ul) {
    if(ul && ul.getAttribute('navshowing')){
        var showingId = ul.getAttribute('navshowing');
        if(showingId && document.getElementById(showingId)){
            var subId = document.getElementById(showingId).getAttribute('navsub');
            var submenu = document.getElementById(subId);
            subId = subId.replace("ul","id");
            var sm =  document.getElementById(subId.replace(/nav\-/,'nav-submenu-'));
            navMobileHideMenu(submenu);
            var fstChid = getFirstChild(sm);
            var getParentId = fstChid.getAttribute("navparent");
            var getParElem = document.getElementById(getParentId);
            if(getParElem.className.indexOf("active")!= -1)
                getParElem.className = getParElem.className.replace("active","");
            ul.removeAttribute('navshowing');
            sm.style.display = 'none';
        }
    }
}

navDisable =function(ev){
    ev = ev || window.event;
    var targt = ev.target;
    ev.stopPropagation();
    if(targt && targt.tagName){
        while(targt && targt.tagName && targt.tagName.toLowerCase()!="ul"){// No I18N
            if(targt.tagName.toLowerCase()=="body"){
                break;
            }else{
                targt = targt.parentNode;
            }
        }
        if(targt && targt.tagName.toLowerCase()=="ul" && (targt.id=="nav-top"|| targt.hasAttribute("navparent") || target.id=="childPageParent")){
            return;
            }
    }
    var lis = document.getElementsByTagName("li");
    var li,elem;
    for(var i=0;(li=lis[i]);i++){
        if(li.className.indexOf("active")!=-1){
            elem = li;
            break;
        }
    }
    if(elem){
        navMobileHideMenu(elem.parentNode);
    }
}

navMobileShowMenu = function(event) {
    var subId = this.getAttribute('navsub');
    if(!subId)return;
    document.getElementsByTagName('body')[0].style.overflowX="hidden";// No I18N
    subId = subId.replace("ul","id");
    var sm =  document.getElementById(subId.replace(/nav\-/,'nav-submenu-'));
    var showingId = document.getElementById("nav-top").getAttribute('navshowing');
    var fstChild = getFirstChild(sm);
    var getParentId = fstChild.getAttribute("navparent");
    if((subId==="nav-idMore" && showingId==="nav-liMore") || (showingId===getParentId)){
        //sm.style.display="none";
        navMobileHideMenu(this.parentNode);
        return;
    }
    navMobileHideMenu(this.parentNode);
    sm.style.display = '';
    var getParElem = document.getElementById(getParentId);
    var parElem = document.getElementById(getParElem.parentNode.getAttribute("navparent"));
    if(getParElem.className.indexOf("active")== -1){
        getParElem.className+=" active";// No I18N
    }
    sm.style.left = 0+'px';
    var paddingLeft=parseInt(navGetStyle(sm,"padding-left").replace("px",""));// No I18N
    var paddingRight=parseInt(navGetStyle(sm,"padding-right").replace("px",""));// No I18N
    if(navAlignHor){
        sm.style.width=(sm.parentNode.clientWidth-paddingLeft-paddingRight)+"px";
    }else{
        sm.style.width=sm.parentNode.clientWidth+"px";
    }
    if(window.innerWidth<350 && navAlignHor){
        sm.style.width="100%";
    }
    var par=sm.parentNode;
    var diffTop = navOffset(this);
    var diff = document.getElementById('childPageParent');
    var offsetChildPage = navOffset(diff);
    if(navAlignHor){
        if(this.parentNode.id == 'nav-top' &&document.getElementById('childPageParent').style.top==""){
            document.getElementById('childPageParent').style.top=diffTop.top-offsetChildPage.top+this.offsetHeight+"px";
        }
    }else{
        if(this.parentNode.id === 'nav-top'){
            document.getElementById('childPageParent').style.top=(this.offsetHeight-this.parentNode.offsetTop+diffTop.top)+"px";
        }
    }
    this.parentNode.setAttribute("navshowing",this.id);
    var clickLi = this.getAttribute("navsub");
    var listFirstLi  = document.getElementById(clickLi);
    if(!listFirstLi.children[0].hasAttribute("back") && !listFirstLi.children[0].hasAttribute("firstNav")){
        var curElem = document.getElementById(this.id);
        if(this.id!="nav-li987" && this.id!="nav-liMore"){
            var firstLi = curElem.cloneNode(true);
            firstLi.removeAttribute("id");
            if(firstLi.getAttribute("class").indexOf("selected")!=-1){
                firstLi.setAttribute("class","selected");
            }
            else{
                firstLi.removeAttribute("class");
            }
            firstLi.removeAttribute("navsub");
            var fstChd = getFirstChild(firstLi);
            var href = fstChd.getAttribute('href');
            if(parent.mobilePreview && href!=null && href.indexOf("?mobile=true")== -1){
                href=href+"?mobile=true";//No I18N
            }
            fstChd.setAttribute('href',href);
            firstLi.setAttribute("firstNav","true");
            listFirstLi.insertBefore(firstLi,listFirstLi.firstChild);
        }
    }
    if(navAlignHor && parElem == null){
        if(fstChild.children[0].firstChild.hasAttribute('more')){
            fstChild.children[0].style.display ='none';
        }
    }
    else if(!listFirstLi.children[0].hasAttribute("back") && this.id!="nav-liMore" && this.parentNode.id!=="nav-top"){
        var back = document.createElement('li');
        back.setAttribute("back","true");
        back.style.cursor='pointer';
        back.onclick = function(){
            this.className ='active';
            navRightAli(getParentId,this.parentNode.parentNode.id);
        }
        var a = document.createElement('a');
        var span = document.createElement('span');
        span.innerHTML="&#8592;Back";//No I18N
        span.style.alignContent="center";// No I18N
        a.appendChild(span);
        back.appendChild(a);
        listFirstLi.insertBefore(back,listFirstLi.firstChild);
    }
    if(!navAlignHor){
        //sm.style.left = "-100%";
    }
    if(parElem || (mobile && this.parentNode.id == 'nav-top')){
        sm.style.left = "100%";
        var np;
        if(!navAlignHor && this.parentNode.id == 'nav-top'){
            np = this.parentNode;
        }
        else{
            np = getParElem.parentNode.parentNode;
        }
        if(!navAlignHor && (np.offsetHeight < sm.offsetHeight)){
            //document.getElementById('navigation').style.height=sm.offsetHeight+"px";
        }
        navLeftAlign(np,sm,10);
    }
    document.getElementsByTagName('body')[0].style.overflowX="";// No I18N
}

window.onchangeorientation=function(){
    if(document.readyState=="complete" && (typeof(responsiveTheme)!="undefined" && responsiveTheme==true)){
        navActivate();
    }
    resizeElements();
}

