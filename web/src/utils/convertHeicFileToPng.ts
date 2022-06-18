import heic2any from "heic2any";

export default async (f: File): Promise<File> => {
  // https://stackoverflow.com/questions/57127365/make-html5-filereader-working-with-heic-files
  const heicUrl = URL.createObjectURL(f);
  const heicFetched = await fetch(heicUrl)
  const heicBlob = await heicFetched.blob()
  const pngBlob = await heic2any({ blob: heicBlob }) as Blob
  return new File([pngBlob], f.name.toLowerCase().replace(".heic", ".png"))
}
