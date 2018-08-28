function Complie(el,vm){
  this.vm = vm;
  this.el = document.querySelector(el);
  this.fragment = null;
  this.init();
}

Complie.prototype = {
  init:function(){
    if(this.el){
      this.fragment = this.nodeToFragment(this.el);
      this.compileElement(this.fragment);
      this.el.appendChild(this.fragment);
    }else{
      console.log('Dom 元素不存在!');
    }
  },
  compileText:function(node,exp){
    var self = this;
    var initText = this.vm[exp];
    this.updateText(node,initText);
    new Watcher(this.vm,exp,function(value){
      self.updateText(node,value);
    });
  },
  nodeToFragment:function(el){
    var fragment = document.createDocumentFragment();
    var child = el.firstChild;
    while(child){
      fragment.appendChild(child);
      child = el.firstChild;
    }
    return fragment;
  },
  compileElement:function(el){
    var childNodes = el.childNodes;
    var self = this;
    [].slice.call(childNodes).forEach(function(node){
      var reg = /\{\{(.*)\}\}/;
      var text = node.textContent;
      if(self.isElementNode(node)){
        self.compile(node);
      } else if(self.isTextNode(node) && reg.test(text)){
        self.compileText(node,reg.exec(text)[1]);
      }

      if(node.childNodes && node.childNodes.length){
        self.compileElement(node);
      }
    });
  },
  compile:function(node){
    var nodeAttrs = node.attributes;
    var self = this;
    Array.prototype.forEach.call(nodeAttrs,function(attr){
      var attrName = attr.name;
      if(self.isDirective(attrName)){
        var exp = attr.value;
        var dir = attrName.substring(2);

        if(self.isEventDirective(dir)){
          self.compileEvent(node,self.vm,exp,dir);
        }else{
          self.compileModel(node,self.vm,exp,dir)
        }
        node.removeAttribute(attrName);
      }
    });
  },
  compileText:function(node,exp){
    var self = this;
    var initText = this.vm[exp];
    this.updateText(node,initText);
    new Watcher(this.vm,exp,function(value){
      self.updateText(node,value);
    });
  },
  compileModel:function (node,vm,exp,dir) {
    var self = this;
    var val = this.vm[exp];
    this.modelUpdater(node,val);

    new Watcher(this,vm,exp,function(value){
      self.modelUpdater(node,value);
    });

    node.addEventListener('input',function(e){
      var newValue = e.target.value;
      if(val === newValue){
        return;
      }
      self.vm[exp] = newValue;
      val = newValue;
    });
  },
  modelUpdater:function(node,value,oldValue){
    node.value = typeof value === 'undefined' ? '' : value;
  },
  updateText:function(node,value){
    node.textContent = typeof value === 'undefined'?'':value;
  },
  isEventDirective:function(dir){
    return dir.indexOf('on:') === 0;
  },
  isDirective:function(attr){
    return attr.indexOf('v-') == 0;
  },
  isTextNode:function(node){
    return node.nodeType == 3;
  },
  isElementNode:function(node){
    return node.nodeType == 1;
  }
};