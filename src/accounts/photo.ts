export async function preparePhoto(file:File):Promise<string>{
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG, or WebP photo.');
 if(file.size>5*1024*1024)throw new Error('Choose a photo smaller than 5 MB.');
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();
  image.src=url;await image.decode();
  if(!image.naturalWidth||!image.naturalHeight)throw new Error('This photo could not be opened. Choose another image.');
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;
  const context=canvas.getContext('2d');if(!context)throw new Error('Photo editing is unavailable in this browser.');
  context.fillStyle='#e5f5ff';context.fillRect(0,0,256,256);
  const size=Math.min(image.naturalWidth,image.naturalHeight);
  context.drawImage(image,(image.naturalWidth-size)/2,(image.naturalHeight-size)/2,size,size,0,0,256,256);
  return canvas.toDataURL('image/jpeg',0.85);
 }catch(error){
  if(error instanceof Error&&error.message.startsWith('Photo editing'))throw error;
  throw new Error('This photo could not be opened. Choose another JPG, PNG, or WebP.');
 }finally{URL.revokeObjectURL(url);}
}
