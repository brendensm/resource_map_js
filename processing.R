library(sf)
library(tigris)
library(jsonlite)
library(dplyr)

mi_counties <- tigris::counties("MI", cb = TRUE) |> 
  dplyr::select(NAME, geometry) |> 
  sf::st_centroid(geometry) |> 
  rename(name = NAME) |> 
  arrange(name)

directory <- st_read("data/raw/narcan_directory.kml") |> 
  rename(name = Name)

st_write(mi_counties, "data/mi_counties.geojson", driver = "GeoJSON")
st_write(directory, "data/narcan_directory.geojson", driver = "GeoJSON")


pharm <- readxl::read_xlsx("data/raw/pharmacy_online_map_data.xlsx") |> 
  select(pharmacy, latitude, longitude) |> 
  st_as_sf(coords = c("longitude", "latitude"), crs = st_crs(mi_counties)) |> 
  rename(name = pharmacy)

st_write(pharm, "data/pharm.geojson", driver = "GeoJSON")
