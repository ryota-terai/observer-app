// ベースマップを作成する
// ここでは3DのOpenStreetMapを表示する
var map =  new maplibregl.Map({
    container: 'map',
    style: 'style.json',
    center: [129.768337, 32.986804],
    zoom: 19,
    hash: true,
    pitch: 30,
    localIdeographFontFamily: false
})

// UIツール
// 右下のズームレベルの＋−ボタンを表示する
map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
// 右上の現在位置の取得ボタンを表示する
map.addControl(new maplibregl.GeolocateControl({positionOptions: {enableHighAccuracy: true},trackUserLocation: true}), 'top-right');
// 左下の尺度を表示する
map.addControl(new maplibregl.ScaleControl() );

// URLを取得
const url = new URL(window.location.href);

// URLSearchParamsオブジェクトを取得
const params = url.searchParams;

// getメソッド
const areaCode = params.get('areaCode'); 

// 画面がロードされたら地図にレイヤを追加する
map.on('load', function () {
    // 避難所情報レイヤを追加
    map.addSource('shelter_point', {
        type: 'geojson',
        data: '/ObserverApp/webresources/rest/shelterInfo?areaCode=' + areaCode + '&P20_007=true&P20_008=true&P20_009=true&P20_010=true&P20_011=true&open=false'
    });
    map.loadImage(
            './img/shelter.png',
        function (error, image) {
                if (error)
                    throw error;
            map.addImage('shelter_icon', image);
        }
    );

    map.addLayer({
        'id': 'shelter_point',
		'type': 'symbol',
        'source': 'shelter_point',
		'layout': {
		'icon-image': 'shelter_icon',
		'icon-size': 0.1
        }   
    });

    map.addSource('shelter_open_point', {
        type: 'geojson',
        data: '/ObserverApp/webresources/rest/shelterInfo?areaCode=' + areaCode + '&P20_007=true&P20_008=true&P20_009=true&P20_010=true&P20_011=true&open=true'
    });
    map.loadImage(
            './img/shelter_open.png',
            function (error, image) {
                if (error)
                    throw error;
                map.addImage('shelter_open_icon', image);
            }
    );

    map.addLayer({
        'id': 'shelter_open_point',
        'type': 'symbol',
        'source': 'shelter_open_point',
        'layout': {
            'icon-image': 'shelter_open_icon',
            'icon-size': 0.1
        }
    });

    // 避難所情報レイヤを追加
    map.addSource('disaster', {
        type: 'geojson',
        data: '/ObserverApp/webresources/rest/disasterInfo'
    });

    map.loadImage(
            './img/comment.png',
        function (error, image) {
                if (error)
                    throw error;
            map.addImage('comment_icon', image);
        }
    );

    // スタイルを設定
    map.addLayer({
        'id': 'disaster',
		'type': 'symbol',
        'source': 'disaster',
		'layout': {
		'icon-image': 'comment_icon',
		'icon-size': 0.1
        }   
    });
});

// 避難所情報の地物をクリックしたときに、コメントを表示する
map.on('click', 'shelter_point', function (e) {
    console.log("click")
    
    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.P20_002;
    var comment = e.features[0].properties.comment;
    if (comment != null) {
        name += '<br>' + comment;
    }
     
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
     
    // ポップアップを表示する
    new maplibregl.Popup()
    .setLngLat(coordinates)
    .setHTML(name)
    .addTo(map);

    // 避難所情報欄に避難所名を記載する
    var shelterName = $("#shelter-name")[0];
    shelterName.innerHTML = name;
});

map.on('click', 'shelter_open_point', function (e) {
    console.log("click")

    var coordinates = e.features[0].geometry.coordinates.slice();
    var name = e.features[0].properties.P20_002;
    var comment = e.features[0].properties.comment;
    name += '<br>避難所開設中';
    name += '<br><a href=\"https://www.google.com/maps/dir/?api=1&destination='
            + e.features[0].geometry.coordinates.slice()[1]
            + ','
            + e.features[0].geometry.coordinates.slice()[0]
            + '\" target=\"_blank\">'
            + '避難所迄のルートを検索</a>';

    if (comment != null) {
        name += '<br>' + comment;
    }

    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }

    // ポップアップを表示する
    new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(name)
            .addTo(map);

    // 避難所情報欄に避難所名を記載する
    var shelterName = $("#shelter-name")[0];
    shelterName.innerHTML = e.features[0].properties.P20_002;
});

// 投稿情報の地物をクリックしたときに、コメントを表示する
map.on('click', 'disaster', function (e) {
    console.log("click")
    
    var coordinates = e.features[0].geometry.coordinates.slice();
    var comment = e.features[0].properties.comment;
    var id = e.features[0].properties.id;
    var picture = e.features[0].properties.picture;

    // コメントに改行コードが含まれている場合、改行タグに変換する
    if(comment.match('\n')){
        comment = comment.replace('\n', '<br>');
    }
    if (picture === true) {
        comment += '<br><iframe src=\"/ObserverApp/faces/post/view/picture.xhtml?id=' + id + '\" width="200" height="150"></iframe>';
        comment += '<br><a href=\"/ObserverApp/faces/post/view/view.xhtml?id=' + id + '\" target=\"_blank\">投稿情報画面で確認</a>';
    }
     
    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    }
     
    new maplibregl.Popup()
    .setLngLat(coordinates)
    .setHTML(comment)
    .addTo(map);
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'shelter_point', function () {
    map.getCanvas().style.cursor = 'pointer';
});
     
// Change it back to a pointer when it leaves.
map.on('mouseleave', 'shelter_point', function () {
    map.getCanvas().style.cursor = '';
});

// Change the cursor to a pointer when the mouse is over the places layer.
map.on('mouseenter', 'disaster', function () {
    map.getCanvas().style.cursor = 'pointer';
});
     
// Change it back to a pointer when it leaves.
map.on('mouseleave', 'disaster', function () {
    map.getCanvas().style.cursor = '';
});

/* // チェックボックスのオンオフでレイヤの表示/非表示を切り替える

$(#shelter-layer).click(function(){
    if(!$(this).prop('checked')){
        map.removeLayer('shelter_point');
    }
}); */