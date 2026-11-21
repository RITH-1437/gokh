# Image credits

Destination photos without a local file are loaded directly from
**Wikimedia Commons** (960 px thumbnails on `thumb.wikimedia.org`, or the
original on `upload.wikimedia.org`). Each one is shown with its author and
license in the app, as the licenses require. If a remote photo fails to load
(e.g. Wikimedia rate-limits with HTTP 429), the app falls back to the
destination's emoji tile.

| Destination | File | Author | License |
| --- | --- | --- | --- |
| Sihanoukville | [Aerial View of Golden Lions Roundabout.jpg](https://commons.wikimedia.org/wiki/File:Aerial_View_of_Golden_Lions_Roundabout.jpg) | Kiensvay | CC BY-SA 3.0 |
| Mondulkiri | [Bou Sra Waterfall, Mondulkiri, Cambodia.jpg](https://commons.wikimedia.org/wiki/File:Bou_Sra_Waterfall,_Mondulkiri,_Cambodia.jpg) | Dtfman | CC BY-SA 3.0 |
| Ratanakiri | [Yeak Laom Lake in Paranoma -Photo 2016-.jpg](https://commons.wikimedia.org/wiki/File:Yeak_Laom_Lake_in_Paranoma_-Photo_2016-.jpg) | Chamnanmuon | CC BY-SA 4.0 |
| Koh Kong | [2015 0319 174425 KohKongIsland Strandidylle.jpg](https://commons.wikimedia.org/wiki/File:2015_0319_174425_KohKongIsland_Strandidylle.jpg) | Christiane Bender | CC BY 2.0 |
| Kulen Mountain | [PhnomKulen.jpg](https://commons.wikimedia.org/wiki/File:PhnomKulen.jpg) | Narith5 | CC BY 2.0 |
| Tonle Sap | [Cambodia, Tonle Sap IMG 3285.JPG](https://commons.wikimedia.org/wiki/File:Cambodia,_Tonle_Sap_IMG_3285.JPG) | Deror_avi | CC BY-SA 3.0 |
| Beng Mealea | [Bengmealea.jpg](https://commons.wikimedia.org/wiki/File:Bengmealea.jpg) | Writer128 | CC BY-SA 3.0 |
| Koh Ker | [0505280017PThompyramid.jpg](https://commons.wikimedia.org/wiki/File:0505280017PThompyramid.jpg) | Peaceofangkor | Public domain |
| Kratie | [20171123 Sunset over Mekong Kratie 3996 DxO.jpg](https://commons.wikimedia.org/wiki/File:20171123_Sunset_over_Mekong_Kratie_3996_DxO.jpg) | Jakub Hałun | CC BY-SA 4.0 |
| Chi Phat | [Cardamom Mountains Cambodia.jpg](https://commons.wikimedia.org/wiki/File:Cardamom_Mountains_Cambodia.jpg) | Andyb3947 | CC BY-SA 4.0 |
| Koh Rong Sanloem | [Koh Rong Sanloem estuary.jpg](https://commons.wikimedia.org/wiki/File:Koh_Rong_Sanloem_estuary.jpg) | Wikirictor | CC BY-SA 3.0 |

All other photos (`src/assets/images/`) are bundled with the project.

**Not yet illustrated:** Sambor Prei Kuk — the candidate file
(`File:Sambor Prei Kuk.jpg`, CC BY 4.0, by MoonsMoon) was rate-limited during
verification and is portrait-oriented, so it was not added.

## Adding a remote photo

1. Pick a file on Commons with a reuse license (CC0, PD, CC BY, CC BY-SA).
2. Use a standard thumbnail width URL (e.g. `/960px-<name>`) and check it loads.
3. Add `image` and `imageCredit` (author, license, file page URL) to the
   destination in `src/data/destinations.ts`, and a row to this table.
4. Images from any other host must also be added to `img-src` in `vercel.json`.
