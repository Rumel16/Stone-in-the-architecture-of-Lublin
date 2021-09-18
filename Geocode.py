import osgeo.ogr as ogr
import osgeo.osr as osr
from geopy.geocoders import Nominatim

mydict = {}

geolocator = Nominatim(user_agent="geocode",
                       format_string="%s, Lublin")
with open("file.csv") as file
lines = plik.readlines()
for line in lines[1:]:
    line = line.strip()
    lsplit = line.split(";")   
    location = geolocator.geocode(lsplit[0])
    if location is not None:            
            tmp = str(lsplit[2] + lsplit[3] + lsplit[4] + 
                lsplit[5] + lsplit[6] + lsplit[7] + 
                lsplit[8] + lsplit[8] + lsplit[10] + 
                lsplit[11] + lsplit[12] + lsplit[13] + 
                lsplit[14] + lsplit[15] + lsplit[16] + 
                lsplit[17])
            stones = tmp.rstrip(", ")           
            mydict[lsplit[0]] = location.latitude, 
                                location.longitude, stones
    else:
        pass
driver = ogr.GetDriverByName("ESRI Shapefile")
fileSHP = driver.CreateDataSource("stones.shp")
coordinateSystem = osr.SpatialReference()
coordinateSystem.ImportFromEPSG(4326)
layer = fileSHP.CreateLayer("stones", coordinateSystem, ogr.wkbPoint)

field = ogr.FieldDefn("stones", ogr.OFTString)
field.SetWidth(200)
layer.CreateField(field)
layer.CreateField(ogr.FieldDefn("Latitude", ogr.OFTReal))
layer.CreateField(ogr.FieldDefn("Longitude", ogr.OFTReal))

for key in mydict.keys():
  feature = ogr.Feature(layer.GetLayerDefn())
  feature.SetField("Stones", mydict[key][2])
  feature.SetField("Latitude", mydict[key][0])
  feature.SetField("Longitude", mydict[key][1])
  wkt = "POINT(%f %f)" % (float(mydict[key][1]), 
                          float(mydict[key][0]))
  point = ogr.CreateGeometryFromWkt(wkt)
  feature.SetGeometry(point)
  layer.CreateFeature(feature)

data_source = None
