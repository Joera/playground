import jsQR from "jsqr";

const decodeQRCode = async (imageData: ImageData) => {
    const qrCodeData = jsQR(imageData.data, imageData.width, imageData.height);
    if (qrCodeData) {
        console.log("QR Code Content:", qrCodeData.data);
    } else {
        console.error("No QR code found in the image.");
    }
};

export const processImage = async (file: File) => {
    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        ctx.drawImage(imageBitmap, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        await decodeQRCode(imageData);
    }
};