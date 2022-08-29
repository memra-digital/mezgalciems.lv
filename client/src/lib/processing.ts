export const formatDate = (input: string) => {
	let nextServiceDate: Date = new Date();

	let date: string[] = input.split(`-`);
	nextServiceDate.setDate(parseInt(date[0]));
	nextServiceDate.setMonth(parseInt(date[1]) - 1);
	nextServiceDate.setHours(parseInt(date[2]));
	nextServiceDate.setMinutes(parseInt(date[3]));

	let hour: string = nextServiceDate.getHours().toString();
	let minute: string = nextServiceDate.getMinutes().toString();

	let monthNumber: number = nextServiceDate.getMonth() + 1
	let month: string = ``;
	switch (monthNumber) {
		case 1:
			month = `janvārī`;
			break;
		case 2:
			month = `februārī`;
			break;
		case 3:
			month = `martā`;
			break;
		case 4:
			month = `aprīlī`;
			break;
		case 5:
			month = `maijā`;
			break;
		case 6:
			month = `jūnijā`;
			break;
		case 7:
			month = `jūlijā`;
			break;
		case 8:
			month = `augustā`;
			break;
		case 9:
			month = `septembrī`;
			break;
		case 10:
			month = `oktobrī`;
			break;
		case 11:
			month = `novembrī`;
			break;
		case 12:
			month = `decembrī`;
	}

	let weekdayNumber: number = nextServiceDate.getDay() + 1;
	let weekday: string = ``;
	switch (weekdayNumber) {
		case 1:
			weekday = `Svētdien`;
			break;
		case 2:
			weekday = `Pirmdien`;
			break;
		case 3:
			weekday = `Otrdien`;
			break;
		case 4:
			weekday = `Trešdien`;
			break;
		case 5:
			weekday = `Ceturtdien`;
			break;
		case 6:
			weekday = `Piektdien`;
			break;
		case 7:
			weekday = `Sestdien`;
			break;
	}

	if (parseInt(hour) < 10) hour = `0` + hour;
	if (parseInt(minute) < 10) minute = `0` + minute;

	return `${weekday}, ${nextServiceDate.getDate()}. ${month} ${hour}:${minute}`;
}

export const parseURLs = (text: string) => {
	return (text || ``).replace(/([^\S]|^)(((https?\:\/\/)|(www\.))(\S+))/gi,
		(match: string, space: string, url: string) => {
			let hyperlink: string = url;
			if (!hyperlink.match(`^https?:\/\/`)) {
				hyperlink = `http://${hyperlink}`;
			}
			return `${space}<a class="link text-blue-500 bg-gradient-to-t from-blue-500 to-blue-500" target="_blank" rel="noopener" href="${hyperlink}">${url}</a>`;
		}
	);
}
export const escapeHTML = (text: string) => {
	return text.split(`<`).join(`&lt;`).split(`>`).join(`&gt;`);
	// For context, you can replace all occurances of a string inside of a string with .split(originalWord).join(newWord).
	// For whatever reason, Typescript throws an error when using string.replaceAll(), says that I should set the compilation
	// target to es2021 or later, but when I do, it says that target doesn't even exist. Welp, what can I expect from Microsoft... 🤷
}