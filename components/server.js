import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 20;


export const getVideos = (dados) => new Promise(async (resolve, reject) => {    
  const siteUrl = `https://www.youtube.com/results?search_query=${dados}`; 
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath('https://<Bucket Name>.s3.amazonaws.com/chromium-v126.0.0-pack.tar'),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.goto(siteUrl);

  try {
    const youtube = await page.evaluate(() => {
      const videoList = document.querySelectorAll('.style-scope.ytd-item-section-renderer.style-scope.ytd-item-section-renderer a');
      const linkArray = [...videoList] 
            
      return linkArray.map( (item) => ({
          title: item.title,
          videoUrl: item.href,
      }));
    })    
    
    const response = extrair(youtube)
    resolve(response)

  } catch (error) {
    reject(error)
  }
  finally {
    await browser.close();
  }
})

function extrair(youtube){ 
  const response = [];
  youtube.map(item => {
    try{
      if(!item.title) return;
      const [part1, part2] = item.videoUrl.split('?v=');
      const [videoId] = part2.split("&");
      const title = item.title.toUpperCase();
      const [url] = item.videoUrl.split("&");
      response.push({title: title, url: url, videoId: videoId})
    }catch(error){}
  })  
  return response;
}