function Vue(options){
  var self = this;
  this.data = options.data;
  this.methods = options.methods;

  Object.keys(this.data).forEach(function(key){
    self.proxyKeys(key);
  });
  observe(this.data);
  new Complie(options.el,this);
  options.mounted.call(this);
}

Vue.prototype = {
  proxyKeys:function(key){
    var self = this;
    Object.defineProperty(this,key,{
      enumerable:false,
      configurable:true,
      get:function(){
        return self.data[key];
      },
      set:function(newVal){
        self.data[key] = newVal;
      }
    });
  }
}
