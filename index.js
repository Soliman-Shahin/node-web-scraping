import express from "express";
import cors from "cors";
import { load } from "cheerio";
import axios from "axios";
import { Parser } from "json2csv";
import fs from "fs";

const app = express();

app.use(cors());

app.use(express.json());

const baseUrl = "https://www.jumia.com.eg/laptops/";

const laptopsData = [];

let port = process.env.PORT || 4800;

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

app.get("/scraping", async (req, res) => {
  try {
    await getLaptops(baseUrl);
    return res.status(200).json({ msg: "file exported successfully" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ err: error });
  }
});

app.listen(port, () => console.log("Scrapper is running on " + port));
