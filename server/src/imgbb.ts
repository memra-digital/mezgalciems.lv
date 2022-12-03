import imgbbUploader from 'imgbb-uploader';

export const uploadImg = (image: string): Promise<any> => {
	return new Promise((resolve, reject) => {
		let imageInput: string[] = image.split(`,`);
		imageInput.splice(0, 1);
		
		imgbbUploader({
			apiKey: process.env.IMGBB_API_KEY,
			base64string: imageInput.join(``)
		}).then((res: any) => {
			resolve(res);
		}).catch((err: any) => {
			reject(err);
		});
	});
}