import fs from "fs/promises";
import sharp from "sharp";
(async ()=>{
  const rootsrc = 'public/icons';
  const androidRes = 'android/app/src/main/res';
  await sharp(`${rootsrc}/icon-72x72-notification.png`).resize(48,48).png().toFile(`${androidRes}/mipmap-mdpi/ic_notification.png`);
  await fs.copyFile(`${rootsrc}/icon-72x72-notification.png`, `${androidRes}/mipmap-hdpi/ic_notification.png`);
  await fs.copyFile(`${rootsrc}/icon-96x96-notification.png`, `${androidRes}/mipmap-xhdpi/ic_notification.png`);
  await fs.copyFile(`${rootsrc}/icon-144x144-notification.png`, `${androidRes}/mipmap-xxhdpi/ic_notification.png`);
  await fs.copyFile(`${rootsrc}/icon-192x192-notification.png`, `${androidRes}/mipmap-xxxhdpi/ic_notification.png`);
  await fs.copyFile(`${rootsrc}/icon-192x192-notification.png`, `${androidRes}/mipmap-anydpi-v26/ic_notification.png`);
  console.log('COPIED_IC_NOTIFICATION');
})().catch(e=>{console.error(e); process.exit(1)});
