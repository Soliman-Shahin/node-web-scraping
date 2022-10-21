import { load } from "cheerio";
import axios from "axios";
import { Parser } from "json2csv";
import fs from "fs";

const baseUrl = "https://www.jumia.com.eg/laptops/";

const laptopsData = [];

async function getLaptops(url) {
  try {
    const response = await axios.get(url);
    const $ = load(response.data);
    const laptops = $("article");

    let title = "";
    let price = "";

    laptops.each(function () {
      title = $(this).find("a .info h3").text();
      price = $(this).find("a .info .prc").text();

      if (title !== "" || price !== "") {
        laptopsData.push({ title, price });
      }
    });

    const pg = $(".pg");

    pg.each(function () {
      if ($(this).attr("aria-label") == "Next Page") {
        let nextPage = baseUrl + $(this).attr("href");
        getLaptops(nextPage);
      } else {
        const parser = new Parser();
        const csv = parser.parse(laptopsData);
        fs.writeFileSync("./exported/laptops.xls", csv);
      }
    });

    console.log("LOADING XLS FILE ...");
  } catch (error) {
    console.error(error);
  }
}

getLaptops(baseUrl);
