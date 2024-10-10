library(sf)
library(tigris)
library(jsonlite)
library(dplyr)

mi_counties <- tigris::counties("MI", cb = TRUE) |> 
  dplyr::select(NAME, geometry) |> 
  sf::st_centroid(geometry) |> 
  rename(name = NAME) |> 
  arrange(name)

directory <- st_read("data/narcan_directory.kml") |> 
  rename(name = Name)

st_write(mi_counties, "data/mi_counties.geojson", driver = "GeoJSON")
st_write(directory, "data/narcan_directory.geojson", driver = "GeoJSON")
