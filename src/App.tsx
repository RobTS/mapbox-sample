import React, {useState} from 'react';
import {
  Button,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import MapboxGL from '@react-native-mapbox-gl/maps';

MapboxGL.setAccessToken('');

type PinType = 'PinBlue' | 'PinGreen' | 'PinRed' | 'PinYellow';
type MarkerProps = {
  id: string;
  draggable?: boolean;
  coordinate: GeoJSON.Point;
  type: PinType;
  onPress?: () => void;
  onDragEnd?: (e: GeoJSON.Point) => void;
  title?: string;
  description?: string;
  onCalloutPress?: () => void;
  rotate?: number;
  opacity?: number;
};

const Markers = {
  PinBlue: require('./assets/MapsBlueMarker2.png'),
  PinGreen: require('./assets/MapsStartMarker2.png'),
  PinRed: require('./assets/MapsEndMarker2.png'),
  PinYellow: require('./assets/MapsYellowMarker2.png'),
};

export const WrappedMarker: React.FC<MarkerProps> = (props: MarkerProps) => {
  if (props.draggable) {
    return <DraggableMarker {...props} />;
  }
  return (
    <MapboxGL.ShapeSource
      key={props.id}
      id={props.id}
      onPress={props.onPress}
      cluster={false}
      shape={props.coordinate}>
      <MapboxGL.SymbolLayer
        id={props.id}
        layerIndex={1000}
        style={{
          iconOffset: [-0.75, -17.25],
          iconImage: Markers[props.type],
          iconSize: 1.4,
          iconRotate: props.rotate || 0,
          iconAllowOverlap: true,
          textAllowOverlap: true,
          iconIgnorePlacement: true,
          textIgnorePlacement: true,
        }}
      />
    </MapboxGL.ShapeSource>
  );
};

const lightStyle = 'mapbox://styles/robts/ckmt0kyff3jz817lk0e9yzp1m';
const satelliteStyle = 'mapbox://styles/robts/ckmt0ph373kj318p1djdmu25i';

const DraggableMarker = (props: MarkerProps) => {
  return (
    <MapboxGL.PointAnnotation
      id={props.id}
      onSelected={props.onPress}
      draggable={props.draggable}
      // @ts-ignore
      onDragEnd={(event: any) => {
        props.onDragEnd?.(event.geometry as GeoJSON.Point);
      }}
      anchor={{x: 0.54, y: 0.86}}
      coordinate={props.coordinate.coordinates}>
      <Image source={Markers[props.type]} style={{height: 50, width: 50}} />
    </MapboxGL.PointAnnotation>
  );
};

const App = () => {
  const [points, setPoints] = useState<GeoJSON.Point[]>([]);
  const [mapVisible, setMapVisible] = useState(true);
  const [draggable, setDraggable] = useState(false);
  const [satStyle, setSatStyle] = useState(false);
  const backgroundStyle = {
    backgroundColor: Colors.lighter,
    flex: 1,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <View style={{flex: 1}}>
        {mapVisible ? (
          <MapboxGL.MapView
            styleURL={satStyle ? satelliteStyle : lightStyle}
            style={{flex: 1}}
            onPress={event => {
              setPoints([...points, event.geometry as GeoJSON.Point]);
            }}>
            {points.map((point, index) => {
              let type: PinType = 'PinBlue';
              if (index === 0) {
                type = 'PinGreen';
              }
              if (index === points.length - 1) {
                type = 'PinRed';
              }
              return (
                <WrappedMarker
                  key={index}
                  id={index.toString()}
                  onDragEnd={point => {
                    setPoints([
                      ...points.slice(0, index),
                      point,
                      ...points.slice(index + 1),
                    ]);
                  }}
                  coordinate={point}
                  draggable={draggable}
                  type={type}
                />
              );
            })}
            {points.length ? (
              <MapboxGL.ShapeSource
                id={'shapesource'}
                shape={{
                  type: 'LineString',
                  coordinates: points.map(point => point.coordinates),
                }}>
                <MapboxGL.LineLayer
                  layerIndex={100}
                  id={'line'}
                  style={{
                    lineColor: '#557000',
                    lineWidth: 3,
                    lineOpacity: 0.84,
                  }}
                />
              </MapboxGL.ShapeSource>
            ) : null}
          </MapboxGL.MapView>
        ) : null}
      </View>
      <ScrollView style={{flex: 1}}>
        <View style={{margin: 10}}>
          <Text style={{textAlign: 'center'}}>
            Tap the map to place markers.
          </Text>
        </View>
        <View style={{margin: 10}}>
          <Button
            title={`Map visible: ${mapVisible} (press to toggle)`}
            onPress={() => setMapVisible(!mapVisible)}
          />
        </View>
        <View style={{margin: 10}}>
          <Button
            title={`Draggable: ${draggable} (press to toggle)`}
            onPress={() => setDraggable(!draggable)}
          />
        </View>
        <View style={{margin: 10}}>
          <Button
            title={`Map style: ${satStyle ? 'sat' : 'light'} (press to toggle)`}
            onPress={() => setSatStyle(!satStyle)}
          />
        </View>
        <View style={{margin: 10}}>
          <Button title={'Reset'} onPress={() => setPoints([])} />
        </View>
        <View style={{margin: 10}}>
          <Text>{JSON.stringify(points, null, 2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
