import { useEffect,useState } from 'react';
import { Box,IconButton,Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const CampaignCarousel=({banners,onNavigate})=>{
  const [index,setIndex]=useState(0);const count=banners.length;
  useEffect(()=>{if(count<2)return undefined;const timer=setInterval(()=>setIndex((value)=>(value+1)%count),5000);return()=>clearInterval(timer);},[count]);
  if(!count)return null;const safeIndex=index%count;const banner=banners[safeIndex];const move=(step)=>setIndex((value)=>(value+step+count)%count);
  return <Box sx={{position:'relative',mx:'4vw',my:2,borderRadius:3,overflow:'hidden',bgcolor:'#e8f3ee',minHeight:{xs:170,md:280}}}><Box onClick={()=>banner.targetUrl&&onNavigate?.(banner.targetUrl)} sx={{cursor:banner.targetUrl?'pointer':'default'}}><img src={banner.mobileImage||banner.image} alt={banner.name} style={{width:'100%',height:'clamp(170px,25vw,320px)',objectFit:'cover',display:'block'}}/><Box sx={{position:'absolute',inset:'auto 0 0',p:{xs:2,md:3},color:'white',background:'linear-gradient(transparent,rgba(0,0,0,.72))'}}><Typography variant="h5" fontWeight={800}>{banner.name}</Typography><Typography>{banner.description}</Typography></Box></Box>{count>1&&<><IconButton aria-label="Previous banner" onClick={()=>move(-1)} sx={{position:'absolute',left:12,top:'45%',bgcolor:'rgba(255,255,255,.9)'}}><ChevronLeftIcon/></IconButton><IconButton aria-label="Next banner" onClick={()=>move(1)} sx={{position:'absolute',right:12,top:'45%',bgcolor:'rgba(255,255,255,.9)'}}><ChevronRightIcon/></IconButton><Box sx={{position:'absolute',bottom:8,left:'50%',transform:'translateX(-50%)',display:'flex',gap:.75}}>{banners.map((item,dot)=><Box component="button" aria-label={`Show ${item.name}`} key={item.id} onClick={()=>setIndex(dot)} sx={{width:dot===index?22:8,height:8,p:0,border:0,borderRadius:4,bgcolor:dot===index?'white':'rgba(255,255,255,.55)',cursor:'pointer'}}/>)}</Box></>}</Box>;
};
export default CampaignCarousel;
