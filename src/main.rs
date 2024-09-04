use csv::Writer;
use select::{
    document::Document,
    predicate::{Class, Name},
};
use serde_json;
use std::fs;
use std::io::Cursor;

fn main() {
    let file_content = fs::read_to_string("nhent").unwrap();
    let html_strings: Vec<String> = serde_json::from_str(&file_content).unwrap();

    let mut wtr = Writer::from_path("nhent.csv").unwrap();
    wtr.write_record(&["ID", "Image URL", "Title"]).unwrap();

    let mut title_count = 0;

    for html in html_strings {
        let cursor = Cursor::new(html);
        let document = Document::from_read(cursor).unwrap();

        for gallery in document.find(Class("gallery-favorite")) {
            let id = gallery.attr("data-id").unwrap_or("").to_string();
            let img_url = gallery
                .find(Name("img"))
                .next()
                .and_then(|img| img.attr("data-src"))
                .unwrap_or("")
                .to_string();
            let caption = gallery
                .find(Class("caption"))
                .next()
                .map(|node| node.text())
                .unwrap_or("".to_string());

            if !caption.is_empty() {
                wtr.write_record(&[id, img_url, caption]).unwrap();
                title_count += 1;
            }
        }
    }

    println!("Title Count: {}", title_count);

    wtr.flush().unwrap();
}
