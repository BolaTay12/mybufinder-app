import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Approximate coordinates for Babcock University
const BU_COORDINATES = {
    longitude: 3.7188,
    latitude: 6.8860,
    zoom: 15
};

// Example landmarks mapping (needs real coordinates for full accuracy)
export const CAMPUS_LANDMARKS = {
    // Legacy / Alternative keys to maintain backwards compatibility
    cafeteria_a: { name: 'Cafeteria A', lng: 3.723605, lat: 6.892680, type: 'dining' },
    cafeteria_b: { name: 'Cafeteria B', lng: 3.723605, lat: 6.892680, type: 'dining' },
    library: { name: 'Laz Otti Library', lng: 3.722333, lat: 6.892156, type: 'academic' },
    sports_complex: { name: 'Stadium Babcock University', lng: 3.727702, lat: 6.894722, type: 'sports' },
    sat: { name: 'SAT Building', lng: 3.722546, lat: 6.888716, type: 'academic' },
    admin_block: { name: 'Admin Block', lng: 3.721884, lat: 6.888839, type: 'admin' },

    // Values from ReportItem.jsx Select List
    admin_block_strategy: { name: 'Admin Block & Strategy Blk', lng: 3.721884, lat: 6.888839, type: 'admin' },
    new_admin_block: { name: 'New Admin Block', lng: 3.721884, lat: 6.888839, type: 'admin' },
    sc_tech_auditorium: { name: 'Sc & Tech Auditorium & Bookshop', lng: 3.722546, lat: 6.888716, type: 'academic' },
    andrew_park: { name: 'Andrew Park', lng: 3.721347, lat: 6.887380, type: 'recreation' },
    eah: { name: 'Joel Awoniyi Faculty of Education & Humanities (EAH)', lng: 3.720572, lat: 6.890227, type: 'academic' },
    bbs: { name: 'BBS (Babcock Business School)', lng: 3.723907, lat: 6.890815, type: 'academic' },
    staff_quarters: { name: 'Staff Quarters', lng: 3.724500, lat: 6.894000, type: 'residential' },
    babrite: { name: 'Shopping Mall-Yetunde Makinde Super Store (BABRITE)', lng: 3.720441, lat: 6.891234, type: 'commercial' },
    university_guest_house: { name: 'University Guest House', lng: 3.719922, lat: 6.890511, type: 'residential' },
    sda_church: { name: 'Seventh Day Adventist Church', lng: 3.719595, lat: 6.889607, type: 'religion' },
    bu_high_school_admin: { name: 'BU High School Admin Blk.', lng: 3.718970, lat: 6.890112, type: 'academic' },
    bu_pry_school: { name: 'Babcock University Pry School', lng: 3.718500, lat: 6.889500, type: 'academic' },
    buth_a_and_e: { name: 'Accident & Emergency Ward (BUTH)', lng: 3.718502, lat: 6.891814, type: 'medical' },
    buth_ben_carson: { name: 'Ben Carson college of medicine (BUTH 600 SEATER)', lng: 3.716939, lat: 6.891259, type: 'medical' },
    alumni_building: { name: 'Alumni Building', lng: 3.721884, lat: 6.888839, type: 'admin' },
    welch_hall: { name: 'Welch Hall', lng: 3.721435, lat: 6.891750, type: 'residential' },
    amphitheater: { name: 'Amphitheater', lng: 3.722423, lat: 6.890877, type: 'recreation' },
    heritage_building: { name: 'Heritage Building', lng: 3.721884, lat: 6.888839, type: 'academic' }, // fallback approximate
    bursary_division: { name: 'Bursary Division', lng: 3.722889, lat: 6.890103, type: 'admin' },
    new_horizons_1: { name: 'New Horizons 1', lng: 3.723179, lat: 6.890343, type: 'academic' },
    new_horizons_2_new: { name: 'New Horizons 2 (NEW)', lng: 3.723179, lat: 6.890343, type: 'academic' },
    procurement_centre_store: { name: 'Procurement / Centre store', lng: 3.722500, lat: 6.890000, type: 'admin' },
    bucodel: { name: 'BUCODeL', lng: 3.723363, lat: 6.891653, type: 'academic' },
    laz_otti_library: { name: 'Laz Otti Library', lng: 3.722333, lat: 6.892156, type: 'academic' },
    adeleke_hall: { name: 'Adeleke Hall', lng: 3.721148, lat: 6.892800, type: 'residential' },
    topaz_hall: { name: 'Topaz Hall', lng: 3.720611, lat: 6.893462, type: 'residential' },
    emerald_hall: { name: 'Emerald Hall', lng: 3.719985, lat: 6.893701, type: 'residential' },
    neal_wilson_hall: { name: 'Neal Wilson Hall', lng: 3.721716, lat: 6.893053, type: 'residential' },
    winslow_hall: { name: 'Winslow Hall', lng: 3.721660, lat: 6.894008, type: 'residential' },
    gideon_trooper_hall: { name: 'Gideon Trooper Hall', lng: 3.722492, lat: 6.894424, type: 'residential' },
    bethel_splendor_hall: { name: 'Bethel Splendor Hall', lng: 3.723072, lat: 6.894608, type: 'residential' },
    university_cafeteria: { name: 'University Cafeteria', lng: 3.723605, lat: 6.892680, type: 'dining' },
    mandela_hall: { name: 'Mandela Hall', lng: 3.723040, lat: 6.893472, type: 'residential' },
    akande_hall: { name: 'Akande Hall', lng: 3.723637, lat: 6.894130, type: 'residential' },
    queen_esther_hall: { name: 'Queen Esther Hall', lng: 3.724701, lat: 6.892979, type: 'residential' },
    felicia_adebisi_dada_hall: { name: 'Felicia Adebisi Dada Hall', lng: 3.724978, lat: 6.893673, type: 'residential' },
    ameyo_adadevoh_hall: { name: 'Ameyo Adadevoh Hall', lng: 3.724927, lat: 6.894944, type: 'residential' },
    havilah_gold_hall: { name: 'Havilah Gold Hall', lng: 3.726074, lat: 6.894878, type: 'residential' },
    sports_complex: { name: 'Stadium Babcock University', lng: 3.727702, lat: 6.894722, type: 'sports' },
    white_hall: { name: 'White Hall', lng: 3.726330, lat: 6.893770, type: 'residential' },
    nyberg_hall: { name: 'Nyberg Hall', lng: 3.725378, lat: 6.892597, type: 'residential' },
    crystal_hall: { name: 'Crystal Hall', lng: 3.727741, lat: 6.892855, type: 'residential' },
    platinum_hall: { name: 'Platinum Hall', lng: 3.727419, lat: 6.892451, type: 'residential' },
    diamond_hall: { name: 'Diamond Hall', lng: 3.727192, lat: 6.892117, type: 'residential' },
    sapphire_hall: { name: 'Sapphire Hall', lng: 3.727000, lat: 6.891800, type: 'residential' }, // slightly below diamond
    water_works: { name: 'Water Works', lng: 3.724000, lat: 6.880500, type: 'utility' },
    busa_secretariat: { name: 'BUSA Secretariat', lng: 3.723759, lat: 6.892053, type: 'admin' },
    sat_building: { name: 'Science and Technology Building (SAT)', lng: 3.722546, lat: 6.888716, type: 'academic' },
    other: { name: 'Other', lng: 3.722967, lat: 6.889996, type: 'other' } // Center of BU
};

const CampusMap = ({ items = [], selectedLocation = null, onMarkerClick = null }) => {
    const [viewState, setViewState] = useState(BU_COORDINATES);
    const [selectedPin, setSelectedPin] = useState(null);

    const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

    if (!MAPBOX_TOKEN) {
        return (
            <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-center p-6">
                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">map</span>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Mapbox token missing in .env</p>
                </div>
            </div>
        );
    }

    // Group items by location if we're showing search results
    const itemsByLocation = items.reduce((acc, item) => {
        if (item.location) {
            if (!acc[item.location]) acc[item.location] = [];
            acc[item.location].push(item);
        }
        return acc;
    }, {});

    return (
        <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            <Map
                {...viewState}
                onMove={evt => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                mapboxAccessToken={MAPBOX_TOKEN}
                attributionControl={false}
            >
                {/* Markers removed as per request */}
            </Map>
        </div>
    );
};

export default CampusMap;
