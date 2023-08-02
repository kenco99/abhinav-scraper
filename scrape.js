const axios = require("axios");
const cheerio = require("cheerio");
const { Parser } = require("json2csv");
const fs = require("fs");

function convertToCSV(data, filename) {
	const fields = [
		"company",
		"category",
		"products",
		"address",
		"phone",
		"cell",
		"enquiry",
		"website",
	];
	const json2csvParser = new Parser({ fields });

	try {
		const csv = json2csvParser.parse(data);

		fs.writeFileSync(filename, csv);

		console.log("CSV file successfully processed");
	} catch (err) {
		console.error(err);
	}
}

const scrape = async () => {
	try {
		let response = await axios(
			"https://www.karnatakaindustriesonline.com/searchresults.php?Peenya%20Industrial%20Area"
		);

		const html = response.data;
		const $ = cheerio.load(html);

		let detailsArray = [];

		$("#search-background").each(function () {
			let contact = $(this)
				.find('strong:contains("☎")')
				.next()
				.text()
				.split("Cell:");
			let details = {
				company: $(this).find("h2 > strong > font").text(),
				category: $(this).find('i:contains("Category:")').next().text(),
				products: $(this).find('i:contains("Products:")').next().text(),
				address: $(this)
					.find('i:contains("Address:")')
					.nextAll()
					.slice(0, 2)
					.map(function () {
						return $(this).text();
					})
					.get()
					.join(" "),
				phone: contact[0].trim(),
				cell: contact[1] ? contact[1].trim() : null,
				enquiry: $(this).find('i:contains("Send enquiry:")').next().text().trim(),
				website: $(this)
					.find('i:contains("Visit website:")')
					.next()
					.find("a")
					.attr("href"),
			};

			detailsArray.push(details);
		});

		convertToCSV(detailsArray, "fp24hntns.csv");
	} catch (e) {
		console.log(e);
	}
};

scrape();
