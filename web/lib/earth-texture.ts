/** A tiny optional WebGL texture layer. Country picking and vector fallback stay in Canvas2D. */
export function createEarthTexture(onReady:()=>void) {
  const surface=document.createElement('canvas');
  const gl=surface.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});
  if(!gl)return null;
  function shader(type:number,source:string) {
    const s=gl!.createShader(type);if(!s)throw new Error('Shader allocation failed');
    gl!.shaderSource(s,source);gl!.compileShader(s);
    if(!gl!.getShaderParameter(s,gl!.COMPILE_STATUS)) {gl!.deleteShader(s);throw new Error('Texture shader unsupported');}
    return s;
  }
  let program:WebGLProgram|null=null,vertex:WebGLShader|null=null,fragment:WebGLShader|null=null;
  try {
    vertex=shader(gl.VERTEX_SHADER,'attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}');
    fragment=shader(gl.FRAGMENT_SHADER,`
      precision highp float;
      uniform vec2 resolution;
      uniform float radius;
      uniform vec2 center;
      uniform sampler2D earth;
      void main(){
        vec2 p=(gl_FragCoord.xy-resolution*.5)/radius;
        float r2=dot(p,p);if(r2>1.)discard;
        float z=sqrt(1.-r2);
        float lat=asin(clamp(p.y*cos(center.y)+z*sin(center.y),-1.,1.));
        float lon=center.x+atan(p.x,z*cos(center.y)-p.y*sin(center.y));
        vec2 uv=vec2(fract(lon/6.28318530718+.5),lat/3.14159265359+.5);
        vec3 color=texture2D(earth,uv).rgb;
        float daylight=.16+.84*max(0.,dot(vec3(p,z),normalize(vec3(-.6,.65,1.))));
        float rim=pow(1.-z,3.)*.16;
        gl_FragColor=vec4(color*daylight+vec3(.18,.55,.65)*rim,1.);
      }`);
    program=gl.createProgram();if(!program)throw new Error('Program allocation failed');
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Texture linking failed');
  } catch { if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);if(program)gl.deleteProgram(program);return null; }
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const texture=gl.createTexture();let ready=false,disposed=false;
  const image=new Image();
  image.onload=()=>{if(disposed)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,image);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);ready=true;onReady();};
  image.src='/imagery/nasa-blue-marble.jpg';
  return {
    render(width:number,height:number,radius:number,lon:number,lat:number,dpr:number) {
      if(!ready||gl.isContextLost())return null;
      const w=Math.round(width*dpr),h=Math.round(height*dpr);if(surface.width!==w||surface.height!==h){surface.width=w;surface.height=h;}
      gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      const location=gl.getAttribLocation(program!,'position');gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,2,gl.FLOAT,false,0,0);
      gl.uniform2f(gl.getUniformLocation(program!,'resolution'),w,h);gl.uniform1f(gl.getUniformLocation(program!,'radius'),radius*dpr);gl.uniform2f(gl.getUniformLocation(program!,'center'),lon*Math.PI/180,lat*Math.PI/180);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(gl.getUniformLocation(program!,'earth'),0);gl.drawArrays(gl.TRIANGLES,0,6);return surface;
    },
    dispose(){disposed=true;image.onload=null;gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);}
  };
}
