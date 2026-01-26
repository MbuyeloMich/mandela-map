// Helper: toggle dark mode for stats card
function setStatsCardDarkMode(enable) {
  const statsCard = document.getElementById('journey-stats-card');
  if (statsCard) {
    if (enable) {
      statsCard.classList.add('dark-mode');
    } else {
      statsCard.classList.remove('dark-mode');
    }
  }
}
// Patch music play/pause logic to toggle dark mode on stats card
function patchMusicDarkMode() {
  const musicBtn = document.getElementById('music-btn');
  if (!musicBtn) return;
  musicBtn.addEventListener('click', () => {
    setTimeout(() => {
      if (window.isMusicPlaying) {
        setStatsCardDarkMode(true);
      } else {
        setStatsCardDarkMode(false);
      }
    }, 200);
  });
  // Also handle when music is paused/stopped from other controls
  if (window.musicAudio) {
    window.musicAudio.addEventListener('pause', () => setStatsCardDarkMode(false));
    window.musicAudio.addEventListener('play', () => setStatsCardDarkMode(true));
  }
}

document.addEventListener('DOMContentLoaded', patchMusicDarkMode);

// ==================== WOW EFFECTS ==================== 

/**
 * 1. CONFETTI BURST - triggers on major milestones
 */
function triggerConfetti() {
  const confettiPieces = ['🎉', '✨', '🌟', '⭐', '🎊', '🏆', '💫', '🎯'];
  const numPieces = 30;
  
  for (let i = 0; i < numPieces; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = confettiPieces[Math.floor(Math.random() * confettiPieces.length)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-20px';
    confetti.style.delay = Math.random() * 0.5 + 's';
    document.body.appendChild(confetti);
    
    setTimeout(() => confetti.remove(), 3000);
  }
}

/**
 * 3. RIPPLE EFFECT - triggers when location changes
 */
function triggerRipple(lat, lng) {
  if (!map) return;
  
  const point = map.latLngToContainerPoint([lat, lng]);
  const ripple = document.createElement('div');
  ripple.className = 'ripple-effect';
  ripple.style.left = point.x - 15 + 'px';
  ripple.style.top = point.y - 15 + 'px';
  
  document.getElementById('map').appendChild(ripple);
  setTimeout(() => ripple.remove(), 1000);
}

/**
 * 6. ZOOM-IN ANIMATION - adds to location markers
 */
function addZoomInAnimation(marker) {
  if (!marker || !marker._icon) return;
  marker._icon.classList.add('location-zoom-in');
  setTimeout(() => {
    marker._icon.classList.remove('location-zoom-in');
  }, 600);
}

/**
 * 7. ROTATE BADGES - animate milestone badges
 */
function rotateBadge(eventIndex) {
  const eventMarker = eventMarkers.find(m => {
    const html = m._icon?.innerHTML;
    return html && html.includes('milestone-badge');
  });
  
  if (eventMarker && eventMarker._icon) {
    const badge = eventMarker._icon.querySelector('.milestone-badge');
    if (badge) {
      badge.classList.add('spin');
      setTimeout(() => {
        badge.classList.remove('spin');
      }, 800);
    }
  }
}

/**
 * Check if event is a major milestone and trigger confetti
 */
function checkMilestoneAndTriggerEffects(event) {
  if (!event) return;
  
  const eventLower = String(event.event).toLowerCase();
  const isMilestone = /inaugurat.*president|release.*prison|nobel.*peace|first.*democratic|final.*appearance/i.test(eventLower);
  
  if (isMilestone) {
    triggerConfetti();
  }
  
  // Trigger ripple at location
  if (event.endCoords) {
    triggerRipple(event.endCoords[1], event.endCoords[0]);
  }
  
  // Trigger badge rotation
  rotateBadge(event.index);
  
  // Add trail glow to latest path
  addTrailGlow();
}

/**
 * 5. TRAIL GLOW - Add glow effect to recent paths
 */
function addTrailGlow() {
  pathLayers.forEach((path, index) => {
    if (path._path && index >= pathLayers.length - 3) {
      path._path.classList.add('trail-glow');
      setTimeout(() => {
        path._path.classList.remove('trail-glow');
      }, 3000);
    }
  });
}

/**
 * 9. ANIMATED COUNTER - Animate number changes
 */
function animateCounter(element, start, end, duration = 1000) {
  if (!element) return;
  
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    
    // Format based on value
    if (element.id === 'stat-distance') {
      element.textContent = Math.floor(current).toLocaleString() + ' km';
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

/**
 * Update stats with animation
 */
function updateStatsWithAnimation(newValues) {
  const statsCard = document.getElementById('journey-stats-card');
  if (statsCard) {
    statsCard.classList.add('stat-update');
    setTimeout(() => statsCard.classList.remove('stat-update'), 600);
  }
  
  // Animate each stat
  const distElement = document.getElementById('stat-distance');
  const provincesElement = document.getElementById('stat-provinces');
  const prisonElement = document.getElementById('stat-prison');
  const internationalElement = document.getElementById('stat-international');
  
  if (distElement && newValues.distance !== undefined) {
    const currentVal = parseInt(distElement.textContent.replace(/[^0-9]/g, '')) || 0;
    animateCounter(distElement, currentVal, newValues.distance, 800);
  }
  
  if (provincesElement && newValues.provinces !== undefined) {
    const currentVal = parseInt(provincesElement.textContent) || 0;
    animateCounter(provincesElement, currentVal, newValues.provinces, 600);
  }
  
  if (prisonElement && newValues.prison !== undefined) {
    const currentVal = parseInt(prisonElement.textContent) || 0;
    animateCounter(prisonElement, currentVal, newValues.prison, 600);
  }
  
  if (internationalElement && newValues.international !== undefined) {
    const currentVal = parseInt(internationalElement.textContent) || 0;
    animateCounter(internationalElement, currentVal, newValues.international, 600);
  }
}

/*!
 * Nelson Mandela's Life Journey Map Visualization - Main Script
 * Author: sansan0
 * GitHub: https://github.com/sansan0/mao-map
 */

// ==================== Application Initialization ====================
/**
 * Initialize application with English language only
 */
async function initApp() {
  try {
    console.log('Initializing Mandela Map application...');
    
    // Load geographic data
    await loadGeographicData();
    
    // Initialize map
    initMap();
    
    // Load trajectory data
    trajectoryData = await loadTrajectoryData();
    
    if (!trajectoryData || !trajectoryData.events) {
      throw new Error('Failed to load trajectory data');
    }
    
    // Setup timeline
    const slider = document.getElementById('timeline-slider');
    if (slider && trajectoryData.events) {
      slider.max = trajectoryData.events.length - 1;
    }
    
    // Display initial event
    showEventAtIndex(0, false);
    updateStatistics();
    
    console.log('Application initialized successfully');
  } catch (error) {
    console.error('Application initialization failed:', error);
  }
}

// ==================== Global Variables ====================
let map = null;
let regionsData = null;
let trajectoryData = null;
let currentEventIndex = 0;
let previousEventIndex = 0;
let isPlaying = false;
let playInterval = null;
let eventMarkers = [];
let locationLabels = [];
let locationLabelsGroup = null;
let pathLayers = [];
let coordinateMap = new Map();
let locationGroups = new Map();
let locationMarkers = new Map();
let statsHoverTimeout = null;
let currentPlaySpeed = 1000;
// Heat map state
let heatmapLayerGroup = null;
let isHeatmapVisible = false;
let isPanelVisible = true;
let isFeedbackModalVisible = false;
let isCameraFollowEnabled = true;
let isDragging = false;

let isPoetryAnimationPlaying = false;
let poetryAnimationTimeout = null;

let isMusicModalVisible = false;
let currentMusicIndex = 0;
let isMusicPlaying = false;
let musicAudio = null;
let musicProgressInterval = null;
let musicVolume = 0.5;

// Add audio state management variables
let audioLoadingPromise = null;
let isAutoPlayPending = false;
let currentAudioEventListeners = new Set();

let highlightedPaths = [];
let highlightTimeout = null;
let currentHighlightedEventIndex = -1;

let animationConfig = {
  pathDuration: 5000, // Control path drawing speed
  timelineDuration: 1500, // Timeline animation duration
  cameraFollowDuration: 2000, // Camera follow animation duration
  cameraPanDuration: 1500, // Camera pan animation duration
  isAnimating: false,
  motionOptions: {
    auto: false, // Manual animation control
    easing: L.Motion.Ease.easeInOutQuart,
  },
};

// Camera speed level configuration
const CAMERA_SPEED_LEVELS = [
  {
    name: "ui.animation.speedLevels.fastest",
    cameraFollowDuration: 600,
    cameraPanDuration: 400,
  },
  {
    name: "ui.animation.speedLevels.fast",
    cameraFollowDuration: 2000,
    cameraPanDuration: 1500,
  },
  {
    name: "ui.animation.speedLevels.slow",
    cameraFollowDuration: 3500,
    cameraPanDuration: 2800,
  },
  {
    name: "ui.animation.speedLevels.slowest",
    cameraFollowDuration: 5000,
    cameraPanDuration: 4000,
  },
];

let motionPaths = new Map();
let animationQueue = [];
let isAnimationInProgress = false;

// Current location marker
let currentLocationMarker = null;
let currentLocationTrackingLines = [];

// ==================== Global Constants ====================
const INTERNATIONAL_COORDINATES = {
  "Tanzania Dar es Salaam": [39.2695, -6.8021],
  "United States New York": [-74.0060, 40.7128],
};

/**
 * Detect if device is mobile
 */
function isMobileDevice() {
  return window.innerWidth <= 768;
}

// ==================== Mobile Interactions ====================
/**
 * Toggle control panel visibility
 */
function toggleControlPanel() {
  const panel = document.getElementById("timeline-control");
  const toggleBtn = document.getElementById("toggle-panel-btn");
  const mapEl = document.getElementById("map");

  if (isPanelVisible) {
    panel.classList.add("hidden");
    toggleBtn.textContent = "⬆";
    mapEl.classList.remove("panel-visible");
    mapEl.classList.add("panel-hidden");
    isPanelVisible = false;
  } else {
    panel.classList.remove("hidden");
    toggleBtn.textContent = "⚙";
    mapEl.classList.remove("panel-hidden");
    mapEl.classList.add("panel-visible");
    isPanelVisible = true;
  }

  setTimeout(() => {
    if (map && map.invalidateSize) {
      map.invalidateSize({
        animate: true,
        pan: false,
      });
    }
  }, 350);
}

/**
 * Get control panel height
 */
function getControlPanelHeight() {
  const panel = document.getElementById("timeline-control");
  if (!panel || panel.classList.contains("hidden")) {
    return 0;
  }

  const rect = panel.getBoundingClientRect();
  return rect.height;
}

/**
 * Initialize mobile interaction features
 */
function initMobileInteractions() {
  const toggleBtn = document.getElementById("toggle-panel-btn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleControlPanel);
  }

  if (map && isMobileDevice()) {
    map.on("dblclick", (e) => {
      e.originalEvent.preventDefault();
      toggleControlPanel();
    });
  }

  initPanelDragClose();
}

/**
 * Initialize detail panel drag-to-close functionality (mobile)
 */
function initPanelDragClose() {
  if (!isMobileDevice()) return;

  const panel = document.getElementById("location-detail-panel");
  const panelHeader = panel?.querySelector(".panel-header");
  const backdrop = document.getElementById("panel-backdrop");

  if (!panel || !panelHeader) return;

  let touchState = {
    startY: 0,
    currentY: 0,
    deltaY: 0,
    startTime: 0,
    isDragging: false,
    hasMoved: false,
    isProcessing: false,
  };

  function resetAllStates(isClosing = false) {
    touchState = {
      startY: 0,
      currentY: 0,
      deltaY: 0,
      startTime: 0,
      isDragging: false,
      hasMoved: false,
      isProcessing: false,
    };

    panel.classList.remove("dragging");
    panelHeader.classList.remove("dragging");

    if (!isClosing) {
      panel.style.transform = "translateY(0)";
      panel.style.transition =
        "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

      if (backdrop) {
        backdrop.style.opacity = "0.3";
        backdrop.style.transition = "opacity 0.3s ease";
      }

      if (!panel.classList.contains("visible")) {
        panel.classList.add("visible");
      }

      setTimeout(() => {
        if (panel.style.transition.includes("transform")) {
          panel.style.transition = "";
        }
        if (backdrop && backdrop.style.transition.includes("opacity")) {
          backdrop.style.transition = "";
        }
      }, 350);
    }
  }

  function safeClosePanel() {
    touchState.isProcessing = true;

    panel.style.transform = "translateY(100%)";
    panel.style.transition =
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    if (backdrop) {
      backdrop.style.opacity = "0";
      backdrop.style.transition = "opacity 0.3s ease";
    }

    setTimeout(() => {
      try {
        hideDetailPanel();
      } catch (error) {
        console.error("Error closing panel:", error);
      }

      setTimeout(() => {
        resetAllStates(true);
      }, 100);
    }, 300);
  }

  function handleTouchStart(e) {
    if (touchState.isProcessing) {
      return;
    }

    if (
      e.target.closest(".panel-close") ||
      e.target.closest(".panel-content")
    ) {
      return;
    }

    const touch = e.touches[0];
        // Heat map toggle
        const heatmapBtn = document.getElementById('heatmap-toggle-btn');
        if (heatmapBtn) {
          heatmapBtn.addEventListener('click', () => {
            isHeatmapVisible = !isHeatmapVisible;
            heatmapBtn.classList.toggle('active', isHeatmapVisible);
            if (isHeatmapVisible) {
              showHeatmap();
            } else {
              hideHeatmap();
            }
          });
        }
    touchState.startY = touch.clientY;
    touchState.currentY = touch.clientY;
    touchState.startTime = Date.now();
    touchState.isDragging = true;
    touchState.hasMoved = false;
    touchState.deltaY = 0;

    panel.classList.add("dragging");
    panelHeader.classList.add("dragging");

    panel.style.transition = "none";
    if (backdrop) {
      backdrop.style.transition = "none";
    }

    e.preventDefault();
  }

  function handleTouchMove(e) {
    if (!touchState.isDragging || touchState.isProcessing) {
      return;
    }

    const touch = e.touches[0];
    touchState.currentY = touch.clientY;
    touchState.deltaY = touchState.currentY - touchState.startY;

    if (!touchState.hasMoved && Math.abs(touchState.deltaY) > 3) {
      touchState.hasMoved = true;
    }

    if (touchState.deltaY > 0) {
      const maxDrag = 250;
      const dampingFactor = Math.max(
        0.3,
        1 - (touchState.deltaY / maxDrag) * 0.7
      );
      const transformValue = Math.min(
        touchState.deltaY * dampingFactor,
        maxDrag
      );

      panel.style.transform = `translateY(${transformValue}px)`;

      if (backdrop) {
        const maxOpacity = 0.3;
        const opacityReduction = (touchState.deltaY / 200) * maxOpacity;
        const newOpacity = Math.max(0.05, maxOpacity - opacityReduction);
        backdrop.style.opacity = newOpacity.toString();
      }
    } else {
      panel.style.transform = "translateY(0)";
      if (backdrop) {
        backdrop.style.opacity = "0.3";
      }
    }

    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (!touchState.isDragging) {
      return;
    }

    const duration = Date.now() - touchState.startTime;
    const velocity = duration > 0 ? Math.abs(touchState.deltaY) / duration : 0;

    panel.classList.remove("dragging");
    panelHeader.classList.remove("dragging");

    panel.style.transition =
      "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    if (backdrop) {
      backdrop.style.transition = "opacity 0.3s ease";
    }

    const shouldClose =
      touchState.hasMoved &&
      (touchState.deltaY > 40 ||
        (touchState.deltaY > 20 && velocity > 0.2) ||
        (touchState.deltaY > 10 && velocity > 0.5));

    if (shouldClose) {
      safeClosePanel();
    } else {
      resetAllStates(false);
    }
  }

  function handleTouchCancel(e) {
    if (touchState.isDragging && !touchState.isProcessing) {
      resetAllStates();
    }
  }

  function cleanupEventListeners() {
    panelHeader.removeEventListener("touchstart", handleTouchStart);
    panelHeader.removeEventListener("touchmove", handleTouchMove);
    panelHeader.removeEventListener("touchend", handleTouchEnd);
    panelHeader.removeEventListener("touchcancel", handleTouchCancel);
  }

  function bindEventListeners() {
    panelHeader.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });

    panelHeader.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    panelHeader.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });

    panelHeader.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });
  }

  cleanupEventListeners();
  bindEventListeners();

  const panelContent = panel.querySelector(".panel-content");
  if (panelContent) {
    panelContent.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    panelContent.addEventListener(
      "touchmove",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );
  }

  const closeBtn = panel.querySelector(".panel-close");
  if (closeBtn) {
    closeBtn.addEventListener(
      "touchstart",
      (e) => {
        e.stopPropagation();
      },
      { passive: true }
    );

    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideDetailPanel();
    });
  }

  window.cleanupDragListeners = cleanupEventListeners;
}

/**
 * Initialize Leaflet map
 */
function initMap() {
  map = L.map("map", {
    center: [-29.6100, 24.5500],
    zoom: 5,
    minZoom: 4,
    maxZoom: 10,
    zoomControl: true,
    attributionControl: false,
    tap: true,
    tapTolerance: 15,
  });

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }
  ).addTo(map);

  // Add OpenStreetMap labels layer for better place names visibility
  L.tileLayer(
    "https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png",
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      opacity: 0.3,
      zIndex: 401,
    }
  ).addTo(map);

  // Add zoom event listener for location labels
  map.on('zoom', updateLocationLabels);
  map.on('moveend', updateLocationLabels);

  console.log("Map initialization completed");
  updateLocationLabels();
}

// ==================== Stats Panel Control ====================
/**
 * Initialize PC stats panel hover interaction
 */
function initStatsHover() {
  const statsPanel = document.getElementById("stats-panel");
  const hoverArea = document.getElementById("stats-hover-area");

  if (!statsPanel || !hoverArea || isMobileDevice()) return;

  function showStatsPanel() {
    if (statsHoverTimeout) {
      clearTimeout(statsHoverTimeout);
      statsHoverTimeout = null;
    }
    statsPanel.classList.add("visible");
  }

  function hideStatsPanel() {
    statsHoverTimeout = setTimeout(() => {
      statsPanel.classList.remove("visible");
    }, 150);
  }

  hoverArea.addEventListener("mouseenter", showStatsPanel);
  hoverArea.addEventListener("mouseleave", hideStatsPanel);
  statsPanel.addEventListener("mouseenter", showStatsPanel);
  statsPanel.addEventListener("mouseleave", hideStatsPanel);
}

/**
 * Update location labels on map based on zoom level
 */
function updateLocationLabels() {
  // Remove previous labels
  if (locationLabelsGroup) {
    map.removeLayer(locationLabelsGroup);
  }
  locationLabels = [];
  
  const zoomLevel = map.getZoom();
  
  // Only show labels when zoomed in enough
  if (zoomLevel < 6) return;
  
  // Create feature group for labels
  locationLabelsGroup = L.featureGroup();
  
  // Only show birthplace and deathplace labels (Qunu = Birthplace, Soweto = Deathplace)
  const locations = [
    { name: "Qunu (Birthplace)", coords: [-32.1231, 28.3352] },
    { name: "Soweto (Deathplace)", coords: [-26.2473, 27.8621] }
  ];

  locations.forEach(location => {
    let style = `
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      border: 1px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    if (location.name.includes('Soweto')) {
      style += 'background: #e53935; border: 1.5px solid #b71c1c;';
    } else {
      style += 'background: rgba(52, 152, 219, 0.8);';
    }
    const label = L.marker(location.coords, {
      icon: L.divIcon({
        html: `<div style="${style}">${location.name}</div>`,
        className: 'location-label',
        iconSize: [100, 20],
        iconAnchor: [50, 10]
      })
    });
    locationLabelsGroup.addLayer(label);
  });

  locationLabelsGroup.addTo(map);
}

// ==================== Detail Info Panel Control ====================
/**
 * Initialize detail info panel interaction
 */
function initDetailPanel() {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");
  const closeBtn = document.getElementById("panel-close-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", hideDetailPanel);
  }

  if (backdrop) {
    backdrop.addEventListener("click", hideDetailPanel);
  }

  if (panel) {
    panel.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  if (!isMobileDevice()) {
    document.addEventListener("click", (e) => {
      if (panel && panel.classList.contains("visible")) {
        const isClickInsidePanel = panel.contains(e.target);
        const isClickOnMarker = e.target.closest(".leaflet-marker-icon");

        if (!isClickInsidePanel && !isClickOnMarker) {
          hideDetailPanel();
        }
      }
    });
  }
}

/**
 * Show location detail info panel
 */
function showDetailPanel(locationGroup) {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");
  const titleEl = document.getElementById("panel-location-title");
  const summaryEl = document.getElementById("panel-visit-summary");
  const contentEl = document.getElementById("panel-content");

  if (!panel || !titleEl || !summaryEl || !contentEl) return;

  const { location, events } = locationGroup;
  const visitCount = events.length;

  // Filter using current language's visit type label
  const transitLabel = i18n.t('ui.visitType.transit');
  const destinationLabel = i18n.t('ui.visitType.destination');
  const startLabel = i18n.t('ui.visitType.start');
  const activityLabel = i18n.t('ui.visitType.activity');
  const birthLabel = i18n.t('ui.visitType.birth');

  const transitCount = events.filter((e) => e.visitType === transitLabel).length;
  const destCount = events.filter((e) => e.visitType === destinationLabel).length;
  const startCount = events.filter((e) => e.visitType === startLabel).length;
  const activityCount = events.filter((e) => e.visitType === activityLabel).length;
  const birthCount = events.filter((e) => e.visitType === birthLabel).length;

  titleEl.textContent = `📍 ${location}`;

  // Use internationalized summary text
  const summaryText = i18n.t('ui.panel.visitSummary', { count: visitCount });

  let descParts = [];
  if (birthCount > 0) descParts.push(`${birthCount}${i18n.t('ui.panel.visitTypes.birth')}`);
  if (destCount > 0) descParts.push(`${destCount}${i18n.t('ui.panel.visitTypes.arrive')}`);
  if (startCount > 0) descParts.push(`${startCount}${i18n.t('ui.panel.visitTypes.depart')}`);
  if (transitCount > 0) descParts.push(`${transitCount}${i18n.t('ui.panel.visitTypes.transit')}`);
  if (activityCount > 0) descParts.push(`${activityCount}${i18n.t('ui.panel.visitTypes.activity')}`);

  if (descParts.length > 0) {
    summaryEl.innerHTML = summaryText + ` (${descParts.join('，')})`;
  } else {
    summaryEl.innerHTML = summaryText;
  }

  const sortedEvents = [...events].sort((a, b) => a.index - b.index);

  const eventListHtml = sortedEvents
    .map((event, index) => {
      const isCurrentEvent = event.index === currentEventIndex;
      const itemClass = isCurrentEvent
        ? "event-item current-event"
        : "event-item";

      let visitTypeClass = "";
      let visitTypeLabel = "";
      let visitOrderClass = "";

      // Use internationalized sequence numbering
      const orderNumber = i18n.t('ui.panel.orderNumber', { n: index + 1 });

      // Get corresponding internationalization label by visit type
      const birthLabel = i18n.t('ui.visitType.birth');
      const startLabel = i18n.t('ui.visitType.start');
      const destinationLabel = i18n.t('ui.visitType.destination');
      const transitLabel = i18n.t('ui.visitType.transit');
      const activityLabel = i18n.t('ui.visitType.activity');

      if (event.visitType === birthLabel) {
        visitTypeClass = "birth-event";
        visitTypeLabel = birthLabel;
        visitOrderClass = "birth-order";
      } else if (event.visitType === startLabel) {
        visitTypeClass = "start-event";
        visitTypeLabel = startLabel;
        visitOrderClass = "start-order";
      } else if (event.visitType === destinationLabel) {
        visitTypeLabel = destinationLabel;
        visitOrderClass = "";
      } else if (event.visitType === transitLabel) {
        visitTypeClass = "transit-event";
        visitTypeLabel = transitLabel;
        visitOrderClass = "transit-order";
      } else if (event.visitType === activityLabel) {
        visitTypeClass = "activity-event";
        visitTypeLabel = activityLabel;
        visitOrderClass = "activity-order";
      }

      // Process event description; if transit type, add internationalization prefix
      let eventDescription = event.originalEvent || event.event;
      if (event.visitType === transitLabel && event.originalEvent) {
        const transitPrefix = i18n.t('ui.panel.transitPrefix');
        eventDescription = transitPrefix + event.originalEvent;
      }

      // Use internationalized age display
      const ageDisplay = event.age
        ? `<div class="event-age">${i18n.t('ui.panel.eventAge', { age: event.age })}</div>`
        : "";

      return `
      <div class="${itemClass} ${visitTypeClass}" data-event-index="${
        event.index
      }">
        <div class="event-header">
          <span class="visit-order-number">${orderNumber}</span>
          <span class="event-date-item">${event.date}</span>
          <span class="visit-order ${visitOrderClass}">${visitTypeLabel}</span>
        </div>
        <div class="event-description">${eventDescription}</div>
        ${ageDisplay}
      </div>
    `;
    })
    .join("");

  contentEl.innerHTML = eventListHtml;

  const eventItems = contentEl.querySelectorAll(".event-item");
  eventItems.forEach((item) => {
    const eventIndex = parseInt(item.dataset.eventIndex);

    item.addEventListener("click", (e) => {
      e.stopPropagation();

      if (currentHighlightedEventIndex === eventIndex) {
        clearPathHighlight();
        return;
      }

      if (currentHighlightedEventIndex !== -1) {
        quickClearPathHighlight();
      }

      highlightEventPath(eventIndex);

      item.classList.add("event-item-clicked");
      setTimeout(() => {
        item.classList.remove("event-item-clicked");
      }, 300);
    });

    item.addEventListener("mouseenter", (e) => {
      if (currentHighlightedEventIndex !== eventIndex) {
        item.style.cursor = "pointer";
        item.style.transform = "translateX(2px)";
      }
    });

    item.addEventListener("mouseleave", (e) => {
      item.style.transform = "";
    });
  });

  if (backdrop && isMobileDevice()) {
    backdrop.classList.add("visible");
  }

  panel.classList.add("visible");

  if (isMobileDevice()) {
    setTimeout(() => {
      initPanelDragClose();
    }, 100);
  }
}

/**
 * Hide detail info panel
 */
function hideDetailPanel() {
  const panel = document.getElementById("location-detail-panel");
  const backdrop = document.getElementById("panel-backdrop");

  if (panel) {
    panel.classList.remove("visible", "dragging");
    panel.style.transform = "";
    panel.style.transition = "";
  }

  if (backdrop) {
    backdrop.classList.remove("visible", "dragging");
    backdrop.style.opacity = "";
    backdrop.style.transition = "";
  }

  if (window.cleanupDragListeners) {
    try {
      window.cleanupDragListeners();
    } catch (error) {
      console.warn("Error cleaning up drag listeners:", error);
    }
  }
}

// ==================== Feedback Feature Control ====================
/**
 * Initialize feedback feature
 */
function initFeedbackModal() {
  const feedbackBtn = document.getElementById("feedback-btn");
  const feedbackModal = document.getElementById("feedback-modal");
  const feedbackBackdrop = document.getElementById("feedback-backdrop");
  const feedbackClose = document.getElementById("feedback-modal-close");

  if (feedbackBtn) {
    feedbackBtn.addEventListener("click", showFeedbackModal);
  }

  if (feedbackClose) {
    feedbackClose.addEventListener("click", hideFeedbackModal);
  }

  if (feedbackBackdrop) {
    feedbackBackdrop.addEventListener("click", hideFeedbackModal);
  }

  if (feedbackModal) {
    feedbackModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  const issuesItem = document.getElementById("feedback-issues");
  const projectItem = document.getElementById("feedback-project");
  const wechatItem = document.getElementById("feedback-wechat");

  if (issuesItem) {
    issuesItem.addEventListener("click", () => {
      openGitHubIssues();
      hideFeedbackModal();
    });
  }

  if (projectItem) {
    projectItem.addEventListener("click", () => {
      openGitHubProject();
      hideFeedbackModal();
    });
  }

  if (wechatItem) {
    wechatItem.addEventListener("click", () => {
      handleWeChatAction();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isFeedbackModalVisible) {
      hideFeedbackModal();
    }
  });

  initWeChatQRModal();
}

/**
 * Show feedback modal
 */
function showFeedbackModal() {
  const feedbackModal = document.getElementById("feedback-modal");
  const feedbackBackdrop = document.getElementById("feedback-backdrop");

  if (feedbackModal && feedbackBackdrop) {
    feedbackBackdrop.classList.add("visible");
    feedbackModal.classList.add("visible");
    isFeedbackModalVisible = true;

    document.body.style.overflow = "hidden";
  }
}

/**
 * Hide feedback modal
 */
function hideFeedbackModal() {
  const feedbackModal = document.getElementById("feedback-modal");
  const feedbackBackdrop = document.getElementById("feedback-backdrop");

  if (feedbackModal && feedbackBackdrop) {
    feedbackBackdrop.classList.remove("visible");
    feedbackModal.classList.remove("visible");
    isFeedbackModalVisible = false;

    document.body.style.overflow = "";
  }
}

/**
 * Open GitHub Issues page
 */
function openGitHubIssues() {
  const issuesUrl = "https://github.com/sansan0/mao-map/issues";
  window.open(issuesUrl, "_blank", "noopener,noreferrer");
}

/**
 * Open GitHub project homepage
 */
function openGitHubProject() {
  const projectUrl = "https://github.com/sansan0/mao-map";
  window.open(projectUrl, "_blank", "noopener,noreferrer");
}

/**
 * Detect if device is mobile
 */
function isMobileDevice() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;
  const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return mobileRegex.test(userAgent) || (hasTouchScreen && isSmallScreen);
}

/**
 * Handle WeChat official account action (mobile: copy, PC: show QR code)
 */
function handleWeChatAction() {
  hideFeedbackModal();

  if (isMobileDevice()) {
    copyWeChatName();
  } else {
    showWeChatQRModal();
  }
}

/**
 * Copy WeChat official account name
 */
function copyWeChatName() {
  const wechatName = i18n.t('messages.wechatName');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(wechatName)
      .then(() => {
        showTemporaryMessage(
          i18n.t('messages.wechatCopied', { name: wechatName }),
          "success"
        );
      })
      .catch(() => {
        showTemporaryMessage(i18n.t('messages.wechatSearch', { name: wechatName }), "info");
      });
  } else {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = wechatName;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      textArea.setSelectionRange(0, 99999);
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showTemporaryMessage(
        i18n.t('messages.wechatCopied', { name: wechatName }),
        "success"
      );
    } catch (err) {
      showTemporaryMessage(i18n.t('messages.wechatSearch', { name: wechatName }), "info");
    }
  }
}

/**
 * Show WeChat QR code modal
 */
function showWeChatQRModal() {
  const modal = document.getElementById("wechat-qr-modal");
  const backdrop = document.getElementById("wechat-qr-backdrop");

  if (modal && backdrop) {
    backdrop.classList.add("visible");
    modal.classList.add("visible");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Hide WeChat QR code modal
 */
function hideWeChatQRModal() {
  const modal = document.getElementById("wechat-qr-modal");
  const backdrop = document.getElementById("wechat-qr-backdrop");

  if (modal && backdrop) {
    backdrop.classList.remove("visible");
    modal.classList.remove("visible");
    document.body.style.overflow = "";
  }
}

/**
 * Initialize WeChat QR code modal
 */
function initWeChatQRModal() {
  const backdrop = document.getElementById("wechat-qr-backdrop");
  const closeBtn = document.getElementById("wechat-qr-close");
  const modal = document.getElementById("wechat-qr-modal");

  if (backdrop) {
    backdrop.addEventListener("click", hideWeChatQRModal);
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", hideWeChatQRModal);
  }

  if (modal) {
    modal.addEventListener("click", (e) => e.stopPropagation());
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("wechat-qr-modal");
      if (modal && modal.classList.contains("visible")) {
        hideWeChatQRModal();
      }
    }
  });
}

/**
 * Show temporary prompt message
 */
function showTemporaryMessage(message, type = "info") {
  const existingMessage = document.querySelector(".temp-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const messageDiv = document.createElement("div");
  messageDiv.className = "temp-message";
  messageDiv.textContent = message;

  const colors = {
    success: { bg: "rgba(39, 174, 96, 0.9)", border: "#27ae60" },
    info: { bg: "rgba(52, 152, 219, 0.9)", border: "#3498db" },
    warning: { bg: "rgba(243, 156, 18, 0.9)", border: "#f39c12" },
  };

  const color = colors[type] || colors.info;

  Object.assign(messageDiv.style, {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: color.bg,
    color: "white",
    padding: "12px 20px",
    borderRadius: "8px",
    border: `1px solid ${color.border}`,
    zIndex: "9999",
    fontSize: "14px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    backdropFilter: "blur(10px)",
    maxWidth: "90vw",
    textAlign: "center",
    lineHeight: "1.4",
  });

  document.body.appendChild(messageDiv);

  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.style.opacity = "0";
      messageDiv.style.transform = "translate(-50%, -50%) scale(0.9)";
      messageDiv.style.transition = "all 0.3s ease";

      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 300);
    }
  }, 3000);
}

/**
 * Show verse animation message (with status control)
 */
function showPoetryMessage() {
  if (isPoetryAnimationPlaying) {
    return;
  }

  isPoetryAnimationPlaying = true;

  if (poetryAnimationTimeout) {
    clearTimeout(poetryAnimationTimeout);
    poetryAnimationTimeout = null;
  }

  const existingPoetry = document.querySelector(".poetry-message");
  if (existingPoetry) {
    existingPoetry.remove();
  }

  const poetryDiv = document.createElement("div");
  poetryDiv.className = "poetry-message";

  const poetryTexts = i18n.t('poems');
  const randomPoetry = poetryTexts[Math.floor(Math.random() * poetryTexts.length)];
  poetryDiv.textContent = randomPoetry;

  document.body.appendChild(poetryDiv);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      poetryDiv.classList.add("poetry-animate");
    });
  });

  poetryAnimationTimeout = setTimeout(() => {
    if (poetryDiv.parentNode) {
      poetryDiv.remove();
    }
    isPoetryAnimationPlaying = false;
    poetryAnimationTimeout = null;
  }, 4500);
}

/**
 * Force stop verse animation
 */
function forceStopPoetryAnimation() {
  if (isPoetryAnimationPlaying) {
    isPoetryAnimationPlaying = false;

    if (poetryAnimationTimeout) {
      clearTimeout(poetryAnimationTimeout);
      poetryAnimationTimeout = null;
    }

    const poetryElements = document.querySelectorAll(".poetry-message");
    poetryElements.forEach((element) => {
      if (element.parentNode) {
        element.remove();
      }
    });
  }
}

// ==================== Coordinate Data Processing ====================
/**
 * Build coordinate mapping table from region data
 */
function buildCoordinateMapFromRegions() {
  console.log("Building coordinate mapping...");

  if (regionsData && regionsData.regions) {
    regionsData.regions.forEach((region) => {
      const extPath = region.ext_path;
      const coordinates = region.coordinates;

      if (
        extPath &&
        coordinates &&
        Array.isArray(coordinates) &&
        coordinates.length === 2
      ) {
        coordinateMap.set(extPath, coordinates);
      }
    });
  }

  Object.entries(INTERNATIONAL_COORDINATES).forEach(([name, coords]) => {
    coordinateMap.set(name, coords);
  });

  console.log("Coordinate mapping established with", coordinateMap.size, "locations");
  console.log("International coordinates:", Object.keys(INTERNATIONAL_COORDINATES));
}

// ==================== Data Loading ====================
/**
 * Load geographic coordinate data
 */
async function loadGeographicData() {
  try {
    const response = await fetch("data/south_africa_regions_coordinates.json");

    if (response.ok) {
      regionsData = await response.json();
      buildCoordinateMapFromRegions();
      console.log("south_africa_regions_coordinates.json loaded successfully");
    } else {
      throw new Error("south_africa_regions_coordinates.json failed to load");
    }

    return true;
  } catch (error) {
    console.warn("External geographic data loading failed:", error.message);
    Object.entries(INTERNATIONAL_COORDINATES).forEach(([name, coords]) => {
      coordinateMap.set(name, coords);
    });
    console.log("Fallback international coordinate data loaded");
    return true;
  }
}

/**
 * Load trajectory event data (English only)
 */
async function loadTrajectoryData() {
  try {
    // Load English event data (95 events version)
    const response = await fetch('data/mandela_trajectory_events_95_en.json');
    if (!response.ok) {
      throw new Error(
        `Failed to load trajectory data: ${response.status} - ${response.statusText}`
      );
    }
    const data = await response.json();

    if (
      !data.events ||
      !Array.isArray(data.events) ||
      data.events.length === 0
    ) {
      throw new Error("Trajectory data format error or is empty");
    }

    return processTrajectoryData(data);
  } catch (error) {
    console.error("Failed to load trajectory data:", error);
    throw error;
  }
}

// ==================== Coordinate Matching ====================
/**
 * Build complete administrative division path
 */
function buildFullLocationPath(locationInfo) {
  if (!locationInfo) return null;

  let parts = [];

  if (locationInfo.country && locationInfo.country !== "中国") {
    parts.push(locationInfo.country);
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
  } else {
    if (locationInfo.province) {
      parts.push(locationInfo.province);
    }
    if (locationInfo.city) {
      parts.push(locationInfo.city);
    }
    if (locationInfo.district && locationInfo.district !== locationInfo.city) {
      parts.push(locationInfo.district);
    }
  }

  const fullPath = parts.length > 0 ? parts.join(" ") : null;

  return fullPath;
}

/**
 * Get coordinates by location information
 */
function getCoordinates(locationInfo) {
  if (!locationInfo) return null;

  if (locationInfo.coordinates) {
    return locationInfo.coordinates;
  }

  const fullPath = buildFullLocationPath(locationInfo);
  if (fullPath && coordinateMap.has(fullPath)) {
    return coordinateMap.get(fullPath);
  }

  console.warn("Unable to match coordinates:", locationInfo, "path:", fullPath);
  return null;
}

/**
 * Get coordinates and format location name
 */
function getCoordinatesWithLocation(locationInfo) {
  if (!locationInfo) return { coordinates: null, location: "Unknown Location" };

  if (locationInfo.coordinates) {
    return {
      coordinates: locationInfo.coordinates,
      location: formatLocationName(locationInfo),
    };
  }

  const fullPath = buildFullLocationPath(locationInfo);
  const coordinates =
    fullPath && coordinateMap.has(fullPath)
      ? coordinateMap.get(fullPath)
      : null;

  return {
    coordinates: coordinates,
    location: formatLocationName(locationInfo),
  };
}

/**
 * Format location name for display
 */
function formatLocationName(locationInfo) {
  if (!locationInfo) return "Unknown Location";

  let parts = [];

  if (locationInfo.country && locationInfo.country !== "中国") {
    parts.push(locationInfo.country);
    if (locationInfo.city) parts.push(locationInfo.city);
  } else {
    if (locationInfo.province) parts.push(locationInfo.province);
    if (locationInfo.city && locationInfo.city !== locationInfo.province) {
      parts.push(locationInfo.city);
    }
    if (locationInfo.district && locationInfo.district !== locationInfo.city) {
      parts.push(locationInfo.district);
    }
  }

  return parts.length > 0 ? parts.join(" ") : "Unknown Location";
}

// ==================== Trajectory Data Processing ====================
/**
 * 处理原始轨迹数据，添加坐标信息
 */
function processTrajectoryData(data) {
  const processedEvents = data.events.map((event, index) => {
    const processed = {
      ...event,
      index: index,
      startCoords: null,
      endCoords: null,
      transitCoords: [],
      startLocation: null,
      endLocation: null,
    };

    if (event.coordinates && event.coordinates.start) {
      const startResult = getCoordinatesWithLocation(event.coordinates.start);
      processed.startCoords = startResult.coordinates;
      processed.startLocation = startResult.location;
    }

    if (event.coordinates && event.coordinates.end) {
      const endResult = getCoordinatesWithLocation(event.coordinates.end);
      processed.endCoords = endResult.coordinates;
      processed.endLocation = endResult.location;
    }

    if (event.coordinates && event.coordinates.transit) {
      processed.transitCoords = event.coordinates.transit
        .map((transit) => getCoordinates(transit))
        .filter((coords) => coords !== null);
    }

    if (!processed.endLocation && processed.startLocation) {
      processed.endLocation = processed.startLocation;
      processed.endCoords = processed.startCoords;
    }

    return processed;
  });

  return {
    ...data,
    events: processedEvents,
  };
}

// ==================== 位置聚合 ====================
/**
 * 按地理位置聚合事件
 */
function groupEventsByLocation(events, maxIndex) {
  const groups = new Map();

  // 获取国际化的访问类型标签
  const birthLabel = i18n.t('ui.visitType.birth');
  const startLabel = i18n.t('ui.visitType.start');
  const destinationLabel = i18n.t('ui.visitType.destination');
  const transitLabel = i18n.t('ui.visitType.transit');
  const activityLabel = i18n.t('ui.visitType.activity');

  // 根据当前语言获取 movementType 标识
  const locale = i18n.getCurrentLocale();
  const birthType = locale === 'en' ? 'Birth' : '出生';
  const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';

  for (let i = 0; i <= maxIndex; i++) {
    const event = events[i];

    if (event.movementType === birthType) {
      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: birthLabel,
        });

        group.types.add(event.movementType);
      }
    } else if (event.movementType === localActivityType) {
      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: activityLabel,
        });

        group.types.add(event.movementType);
      }
    } else {
      if (event.startCoords && event.startLocation) {
        const coordKey = `${event.startCoords[0]},${event.startCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.startCoords,
            location: event.startLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: startLabel,
        });

        group.types.add(event.movementType);
      }

      if (event.endCoords && event.endLocation) {
        const coordKey = `${event.endCoords[0]},${event.endCoords[1]}`;

        if (!groups.has(coordKey)) {
          groups.set(coordKey, {
            coordinates: event.endCoords,
            location: event.endLocation,
            events: [],
            types: new Set(),
          });
        }

        const group = groups.get(coordKey);
        group.events.push({
          ...event,
          index: i,
          date: event.date,
          event: event.event,
          age: event.age,
          visitType: destinationLabel,
        });

        group.types.add(event.movementType);
      }

      if (
        event.transitCoords &&
        event.transitCoords.length > 0 &&
        event.coordinates &&
        event.coordinates.transit
      ) {
        event.transitCoords.forEach((coords, transitIndex) => {
          if (coords && event.coordinates.transit[transitIndex]) {
            const transitInfo = event.coordinates.transit[transitIndex];
            const transitResult = getCoordinatesWithLocation(transitInfo);

            if (transitResult.coordinates && transitResult.location) {
              const coordKey = `${coords[0]},${coords[1]}`;

              if (!groups.has(coordKey)) {
                groups.set(coordKey, {
                  coordinates: coords,
                  location: transitResult.location,
                  events: [],
                  types: new Set(),
                });
              }

              const group = groups.get(coordKey);
              const transitPrefix = i18n.t('ui.panel.transitPrefix');
              group.events.push({
                ...event,
                index: i,
                date: event.date,
                event: transitPrefix + event.event,
                age: event.age,
                visitType: transitLabel,
                originalEvent: event.event,
              });

              group.types.add(event.movementType);
            }
          }
        });
      }
    }
  }

  return groups;
}

/**
 * 根据访问次数获取标记样式类
 */
function getVisitCountClass(visitCount) {
  if (visitCount === 1) return "visits-1";
  if (visitCount === 2) return "visits-2";
  if (visitCount === 3) return "visits-3";
  return "visits-4-plus";
}

/**
 * 根据事件类型获取主要标记类型
 */
function getPrimaryMarkerType(types) {
  // 获取当前语言环境
  const locale = i18n.getCurrentLocale();
  const birthType = locale === 'en' ? 'Birth' : '出生';
  const internationalType = locale === 'en' ? 'International Movement' : '国际移动';
  const longDistanceType = locale === 'en' ? 'Long-distance Movement' : '长途移动';
  const shortDistanceType = locale === 'en' ? 'Short-distance Movement' : '短途移动';
  const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';

  if (types.has(birthType)) return "marker-birth";

  if (types.has(internationalType)) return "marker-international";

  if (types.has(longDistanceType)) return "marker-long-distance";

  if (types.has(shortDistanceType)) return "marker-short-distance";

  const movementTypes = [internationalType, longDistanceType, shortDistanceType].filter((type) =>
    types.has(type)
  );
  if (movementTypes.length > 1) return "marker-mixed";

  if (types.has(localActivityType)) return "marker-activity";

  return "marker-movement";
}

/**
 * 获取事件类型的颜色类别
 */
function getEventTypeColorClass(movementType) {
  if (!movementType) return 'event-marker-default';
  
  const typeStr = String(movementType).toLowerCase();
  
  if (typeStr.includes('birth')) return 'event-marker-birth';
  if (typeStr.includes('prison') || typeStr.includes('imprisonment')) return 'event-marker-imprisonment';
  if (typeStr.includes('president')) return 'event-marker-presidency';
  if (typeStr.includes('international')) return 'event-marker-international';
  if (typeStr.includes('activism') || typeStr.includes('defiance')) return 'event-marker-activism';
  if (typeStr.includes('journey') || typeStr.includes('movement')) return 'event-marker-journey';
  
  return 'event-marker-default';
}

/**
 * Update current location marker with animated tracking lines
 */
function updateCurrentLocationMarker(event, previousIndex) {
  // Remove previous markers
  if (currentLocationMarker) {
    map.removeLayer(currentLocationMarker);
    currentLocationMarker = null;
  }
  
  // Remove previous tracking lines
  currentLocationTrackingLines.forEach(line => {
    if (map.hasLayer(line)) {
      map.removeLayer(line);
    }
  });
  currentLocationTrackingLines = [];
  
  if (!event || !event.endCoords) return;
  
  const [lng, lat] = event.endCoords;
  
  // Create animated current location marker
  const currentLocationIcon = L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        animation: pulse 1.5s infinite;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          background: #FF6B6B;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(255, 107, 107, 0.8);
          z-index: 1000;
        "></div>
      </div>
    `,
    className: 'current-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
  
  currentLocationMarker = L.marker([lat, lng], {
    icon: currentLocationIcon,
    zIndexOffset: 10000
  }).addTo(map);
  
  // Draw animated tracking lines from previous location
  if (previousIndex >= 0 && trajectoryData.events[previousIndex]) {
    const prevEvent = trajectoryData.events[previousIndex];
    if (prevEvent.endCoords) {
      const [prevLng, prevLat] = prevEvent.endCoords;
      
      // Main tracking line
      const trackingLine = L.polyline(
        [[prevLat, prevLng], [lat, lng]],
        {
          color: '#FF6B6B',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5',
          lineCap: 'round',
          lineJoin: 'round'
        }
      ).addTo(map);
      
      currentLocationTrackingLines.push(trackingLine);
      
      // Animated glow line
      const glowLine = L.polyline(
        [[prevLat, prevLng], [lat, lng]],
        {
          color: '#FFB3B3',
          weight: 6,
          opacity: 0.3,
          lineCap: 'round',
          lineJoin: 'round'
        }
      ).addTo(map);
      
      currentLocationTrackingLines.push(glowLine);
    }
  }
  
  // Add transit points if they exist
  if (event.transitCoords && event.transitCoords.length > 0) {
    event.transitCoords.forEach((transitCoord, index) => {
      if (transitCoord && transitCoord.length === 2) {
        const [tLng, tLat] = transitCoord;
        
        const transitLine = L.polyline(
          [[tLat, tLng], [lat, lng]],
          {
            color: '#FFA500',
            weight: 2,
            opacity: 0.5,
            dashArray: '3, 3',
            lineCap: 'round'
          }
        ).addTo(map);
        
        currentLocationTrackingLines.push(transitLine);
      }
    });
  }
}

/**
 * Create location marker
 */
function createLocationMarker(
  locationGroup,
  isCurrent = false,
  isVisited = false
) {
  const { coordinates, location, events, types } = locationGroup;
  const [lng, lat] = coordinates;
  const visitCount = events.length;
  
  // Get the primary event type for color coding
  const primaryEvent = events[0];
  const typeColorClass = getEventTypeColorClass(primaryEvent.movementType);

  const markerClasses = [
    "location-marker",
    getPrimaryMarkerType(types),
    getVisitCountClass(visitCount),
    typeColorClass, // Add event type color coding
  ];

  if (isCurrent) {
    markerClasses.push("current");
    markerClasses.push("glow-effect"); // Add glow effect to current location
  }
  if (isVisited) markerClasses.push("visited");

  const markerContent = visitCount > 1 ? visitCount.toString() : "";

  const baseSize = isMobileDevice() ? 2 : 0;
  const iconSizes = {
    1: [14 + baseSize, 14 + baseSize],
    2: [18 + baseSize, 18 + baseSize],
    3: [22 + baseSize, 22 + baseSize],
    4: [26 + baseSize, 26 + baseSize],
  };

  const sizeKey = visitCount >= 4 ? 4 : visitCount;
  const iconSize = iconSizes[sizeKey];
  const iconAnchor = [iconSize[0] / 2, iconSize[1] / 2];


  // Milestone events: release from prison, inauguration, etc.
  const milestoneEvents = [
    'Released from prison',
    'Inaugurated as President',
    'Nobel Peace Prize',
    'First democratic election',
    'Final public appearance',
    'Death in Soweto',
    'Birth in Qunu',
  ];

  let isMilestone = false;
  let milestoneLabel = '';
  let isPresidency = false;
  let isDeathplace = false;
  let isInternationalTrip = false;
  let flagEmoji = '';
  for (const e of events) {
    if (/inaugurat.*president/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '🎉';
      isPresidency = true;
      break;
    } else if (/release.*prison/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '🕊️';
      break;
    } else if (/nobel.*peace/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '🏅';
      break;
    } else if (/first.*democratic.*election/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '🗳️';
      break;
    } else if (/final.*public.*appearance/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '👋';
      break;
    } else if (/death.*soweto/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '🕯️';
      isDeathplace = true;
      break;
    } else if (/birth.*qunu/i.test(e.event)) {
      isMilestone = true;
      milestoneLabel = '👶';
      break;
    } else if (/international/i.test(e.movementType) || /trip/i.test(e.event)) {
      isInternationalTrip = true;
      // Simple flag detection for Tanzania and USA
      if (/tanzania|dar es salaam/i.test(e.event) || /tanzania/i.test(e.event)) flagEmoji = '🇹🇿';
      else if (/united states|new york/i.test(e.event) || /usa|us /i.test(e.event)) flagEmoji = '🇺🇸';
      else flagEmoji = '🌍';
    }
  }

  let htmlContent = markerContent;
  if (isMilestone) {
    htmlContent += `<span class=\"milestone-badge unique-badge\" title=\"Milestone\">${milestoneLabel}</span>`;
  }
  if (isInternationalTrip && flagEmoji) {
    htmlContent += `<span class=\"milestone-badge flag-badge\" title=\"International Trip\">${flagEmoji}</span>`;
    // Only add USA flag badge if the marker is for New York
    if (flagEmoji === '🇺🇸' && location && location.city === 'New York') {
      htmlContent += `<span class=\"usa-flag-badge\" title=\"USA Trip\">🇺🇸</span>`;
    }
  }

  // Make deathplace marker red
  let customClass = '';
  if (isDeathplace) {
    customClass = ' deathplace-marker';
  }

  // Add unique animated popup for presidency event and international trips
  let markerPopup = null;
  if (isPresidency) {
    markerPopup = L.popup({
      closeButton: false,
      autoClose: false,
      className: 'presidency-popup',
      offset: [0, -iconSize[1] / 2]
    }).setContent('<div class="presidency-popup-content">🇿🇦 Mandela becomes President! 🎉</div>');
  } else if (isInternationalTrip && flagEmoji) {
    markerPopup = L.popup({
      closeButton: false,
      autoClose: false,
      className: 'flag-popup',
      offset: [0, -iconSize[1] / 2]
    }).setContent(`<div class='flag-popup-content'>International Trip ${flagEmoji}</div>`);
  }

  const markerElement = L.divIcon({
    className: markerClasses.join(" ") + customClass,
    html: htmlContent,
    iconSize: iconSize,
    iconAnchor: iconAnchor,
  });

  const marker = L.marker([lat, lng], {
    icon: markerElement,
    interactive: true,
    keyboard: true,
    zIndexOffset: 1000,
  });

  // Show animated popup for presidency/international trip event
  if (markerPopup) {
    setTimeout(() => {
      marker.bindPopup(markerPopup).openPopup();
      setTimeout(() => marker.closePopup(), 3500);
    }, 800);
  }

  const clickHandler = function (e) {
    e.originalEvent.stopPropagation();
    showDetailPanel(locationGroup);
  };

  marker._originalClickHandler = clickHandler;

  marker.on("click", clickHandler);

  marker.on("add", function () {
    setTimeout(() => {
      if (marker._icon) {
        marker._icon.style.zIndex = "1000";
        marker._icon.style.pointerEvents = "auto";
        marker._icon.style.cursor = "pointer";
      }
    }, 50);
  });

  let tooltipText;
  if (visitCount === 1) {
    const event = events[0];
    const transitLabel = i18n.t('ui.visitType.transit');
    const transitPrefix = i18n.t('ui.panel.transitPrefix');
    const isTransit = event.visitType === transitLabel;
    tooltipText = `${event.date} - ${isTransit ? transitPrefix : ""}${
      event.originalEvent || event.event
    }`;
  } else {
    // 使用国际化标签进行过滤
    const transitLabel = i18n.t('ui.visitType.transit');
    const destinationLabel = i18n.t('ui.visitType.destination');
    const startLabel = i18n.t('ui.visitType.start');
    const activityLabel = i18n.t('ui.visitType.activity');
    const birthLabel = i18n.t('ui.visitType.birth');

    const transitCount = events.filter((e) => e.visitType === transitLabel).length;
    const destCount = events.filter((e) => e.visitType === destinationLabel).length;
    const startCount = events.filter((e) => e.visitType === startLabel).length;
    const activityCount = events.filter((e) => e.visitType === activityLabel).length;
    const birthCount = events.filter((e) => e.visitType === birthLabel).length;

    let descParts = [];
    // 使用国际化的计数描述
    if (birthCount > 0) descParts.push(`${birthCount}${i18n.t('ui.panel.visitTypes.birth')}`);
    if (destCount > 0) descParts.push(`${destCount}${i18n.t('ui.panel.visitTypes.arrive')}`);
    if (startCount > 0) descParts.push(`${startCount}${i18n.t('ui.panel.visitTypes.depart')}`);
    if (transitCount > 0) descParts.push(`${transitCount}${i18n.t('ui.panel.visitTypes.transit')}`);
    if (activityCount > 0) descParts.push(`${activityCount}${i18n.t('ui.panel.visitTypes.activity')}`);

    tooltipText = `${location} (${descParts.join(
      "，"
    )})`;
  }

  marker.bindTooltip(tooltipText, {
    direction: "top",
    offset: [0, -15],
    className: "simple-tooltip",
  });

  return marker;
}

// ==================== 地图标记和路径  ====================
/**
 * 创建 motion 动画路径
 */
function createMotionPath(
  fromCoords,
  toCoords,
  transitCoords = [],
  isLatest = false,
  eventIndex = null,
  isConnectionPath = false,
  isReverse = false
) {
  if (!fromCoords || !toCoords) return null;

  const pathCoords = [];

  if (isReverse) {
    // 反向路径：从终点到起点
    pathCoords.push([toCoords[1], toCoords[0]]);

    // 反向添加 transit 点
    if (!isConnectionPath && transitCoords && transitCoords.length > 0) {
      for (let i = transitCoords.length - 1; i >= 0; i--) {
        pathCoords.push([transitCoords[i][1], transitCoords[i][0]]);
      }
    }

    pathCoords.push([fromCoords[1], fromCoords[0]]);
  } else {
    // 正向路径：从起点到终点
    pathCoords.push([fromCoords[1], fromCoords[0]]);

    if (!isConnectionPath && transitCoords && transitCoords.length > 0) {
      transitCoords.forEach((coords) => {
        pathCoords.push([coords[1], coords[0]]);
      });
    }

    pathCoords.push([toCoords[1], toCoords[0]]);
  }

  const polylineOptions = {
    color: isLatest ? "#c0392b" : "#85c1e9",
    weight: isConnectionPath ? 2 : 3,
    opacity: isLatest ? 0.9 : isConnectionPath ? 0.4 : 0.6,
    smoothFactor: 1,
    dashArray: isConnectionPath ? "4, 8" : "8, 8",
  };

  // 拖动时使用极短的动画时间，实现快速显示
  let effectiveDuration = isDragging ? 1 : animationConfig.pathDuration;

  const motionOptions = {
    auto: isDragging ? true : false,
    duration: effectiveDuration,
    easing: isDragging
      ? L.Motion.Ease.easeLinear || animationConfig.motionOptions.easing
      : animationConfig.motionOptions.easing,
  };

  const motionPath = L.motion.polyline(
    pathCoords,
    polylineOptions,
    motionOptions
  );

  // 保存路径元数据
  motionPath._isAnimated = true;
  motionPath._isLatest = isLatest;
  motionPath._needsAnimation = isLatest && !isDragging;
  motionPath._eventIndex = eventIndex;
  motionPath._isConnectionPath = isConnectionPath;
  motionPath._isReverse = isReverse;
  motionPath._originalPathCoords = pathCoords;
    // ==================== Heat Map Logic ====================
    function showHeatmap() {
      if (heatmapLayerGroup) {
        map.removeLayer(heatmapLayerGroup);
        heatmapLayerGroup = null;
      }
      // Count visits per location (by endCoords)
      const freqMap = new Map();
      if (!trajectoryData || !trajectoryData.events) return;
      trajectoryData.events.forEach(ev => {
        if (ev.endCoords && Array.isArray(ev.endCoords)) {
          const key = ev.endCoords.join(',');
          freqMap.set(key, (freqMap.get(key) || 0) + 1);
        }
      });
      heatmapLayerGroup = L.layerGroup();
      freqMap.forEach((count, key) => {
        const [lng, lat] = key.split(',').map(Number);
        // Intensity: min 20px, max 80px radius
        const radius = 20 + Math.min(60, count * 10);
        const opacity = 0.18 + Math.min(0.5, count * 0.07);
        const div = L.divIcon({
          className: 'heatmap-spot',
          iconSize: [radius, radius],
          iconAnchor: [radius/2, radius/2],
          html: '',
        });
        const marker = L.marker([lat, lng], {
          icon: div,
          interactive: false,
          keyboard: false,
          opacity: opacity,
          zIndexOffset: 800,
        });
        heatmapLayerGroup.addLayer(marker);
      });
      heatmapLayerGroup.addTo(map);
    }

    function hideHeatmap() {
      if (heatmapLayerGroup) {
        map.removeLayer(heatmapLayerGroup);
        heatmapLayerGroup = null;
      }
    }
  motionPath._pathOptions = polylineOptions;

  return motionPath;
}

/**
 * 更新路径样式
 */
function updatePathStyle(path, isLatest) {
  if (!path) return;

  const color = isLatest ? "#c0392b" : "#85c1e9";
  const opacity = isLatest ? 0.9 : 0.6;

  path.setStyle({
    color: color,
    opacity: opacity,
    dashArray: "8, 8",
  });

  path._isLatest = isLatest;

  if (path._path) {
    path._path.style.stroke = color;
    path._path.style.strokeOpacity = opacity;
  }
}

/**
 * 静态更新路径（无动画）
 */
function updatePathsStatic(targetIndex) {
  pathLayers.forEach((path) => {
    if (path._map) {
      map.removeLayer(path);
    }
  });
  pathLayers = [];
  motionPaths.clear();

  // 获取当前语言环境的本地活动类型标识
  const locale = i18n.getCurrentLocale();
  const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';

  for (let i = 0; i <= targetIndex; i++) {
    const currentEvent = trajectoryData.events[i];

    if (
      currentEvent.startCoords &&
      currentEvent.endCoords &&
      currentEvent.movementType !== localActivityType
    ) {
      console.log(
        `${isDragging ? "拖动" : "静态"}添加路径: 事件 ${i}: ${
          currentEvent.event
        }`
      );

      const isLatest = i === targetIndex;
      const motionPath = createMotionPath(
        currentEvent.startCoords,
        currentEvent.endCoords,
        currentEvent.transitCoords,
        isLatest,
        i,
        false,
        false
      );

      if (motionPath) {
        motionPath._needsAnimation = false;
        motionPath._initiallyHidden = false;
        motionPath.addTo(map);
        pathLayers.push(motionPath);
        motionPaths.set(i, motionPath);

        // 如果是拖动状态，立即启动动画以快速显示
        if (isDragging && motionPath.motionStart) {
          motionPath.motionStart();
        }

        console.log(`成功添加${isDragging ? "拖动" : "静态"}路径: 事件 ${i}`);
      } else {
        console.warn(`路径创建失败: 事件 ${i}`);
      }
    } else {
      console.log(`跳过事件 ${i}: ${currentEvent.event} (原地活动或缺少坐标)`);
    }
  }
}

/**
 * 创建路径消失动画
 */
function animatePathDisappear(path) {
  if (!path || !path._map) return;

  const pathElement = path._path;
  if (!pathElement) {
    map.removeLayer(path);
    return;
  }

  const totalLength = pathElement.getTotalLength();

  pathElement.style.strokeDasharray = totalLength;
  pathElement.style.strokeDashoffset = "0";
  pathElement.style.transition = `stroke-dashoffset ${animationConfig.pathDuration}ms ease-in-out, opacity ${animationConfig.pathDuration}ms ease-in-out`;

  setTimeout(() => {
    pathElement.style.strokeDashoffset = totalLength;
    pathElement.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    if (path._map) {
      map.removeLayer(path);
    }
  }, animationConfig.pathDuration + 100);
}

/**
 * 批量执行路径消失动画
 */
function batchAnimatePathsDisappear(paths, staggerDelay = 200) {
  if (!paths || paths.length === 0) return;

  return new Promise((resolve) => {
    let completedCount = 0;
    const totalPaths = paths.length;

    paths.forEach((path, index) => {
      setTimeout(() => {
        animatePathDisappear(path);

        completedCount++;
        if (completedCount === totalPaths) {
          setTimeout(() => {
            resolve();
          }, animationConfig.pathDuration + 100);
        }
      }, index * staggerDelay);
    });
  });
}

/**
 * 动画更新路径
 */
function updatePathsAnimated(targetIndex, isReverse = false) {
  if (isReverse) {
    // 反向动画：让后面的路径逐渐消失
    const pathsToRemove = pathLayers.filter(
      (path) => path._eventIndex > targetIndex
    );

    if (pathsToRemove.length > 0) {
      console.log(`开始反向消失动画，移除 ${pathsToRemove.length} 条路径`);

      pathsToRemove.forEach((path, index) => {
        setTimeout(() => {
          animatePathDisappear(path);
        }, index * 100);
      });

      // 延迟清理路径数组和映射
      setTimeout(() => {
        pathsToRemove.forEach((pathToRemove) => {
          const pathIndex = pathLayers.indexOf(pathToRemove);
          if (pathIndex > -1) {
            pathLayers.splice(pathIndex, 1);
          }
          if (motionPaths.has(pathToRemove._eventIndex)) {
            motionPaths.delete(pathToRemove._eventIndex);
          }
        });
      }, pathsToRemove.length * 200 + animationConfig.pathDuration);
    }
  } else {
    // 正向动画：添加新路径
    const currentEvent = trajectoryData.events[targetIndex];

    pathLayers.forEach((path) => {
      if (path._isLatest) {
        updatePathStyle(path, false);
      }
    });

    // 获取当前语言环境的本地活动类型标识
    const locale = i18n.getCurrentLocale();
    const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';

    if (
      currentEvent.startCoords &&
      currentEvent.endCoords &&
      currentEvent.movementType !== localActivityType
    ) {
      console.log(
        `Motion 添加路径: 事件 ${targetIndex} - ${currentEvent.event}`
      );

      const motionPath = createMotionPath(
        currentEvent.startCoords,
        currentEvent.endCoords,
        currentEvent.transitCoords,
        true,
        targetIndex,
        false,
        false
      );

      if (motionPath) {
        motionPath.addTo(map);
        pathLayers.push(motionPath);
        motionPaths.set(targetIndex, motionPath);

        motionPath.motionStart();
      }
    }
  }
}

/**
 * 计算和更新旅程统计信息
 */
function updateJourneyStats(upToIndex) {
  if (!trajectoryData) return;
  
  const events = trajectoryData.events.slice(0, upToIndex + 1);
  
  // Calculate distance traveled
  let totalDistance = 0;
  const visitedProvinces = new Set();
  let prisonYears = 0;
  let internationalTrips = 0;
  
  for (let i = 1; i < events.length; i++) {
    const event = events[i];
    const prevEvent = events[i - 1];
    
    // Calculate distance between consecutive events
    if (event.endCoords && prevEvent.endCoords) {
      const [lng1, lat1] = prevEvent.endCoords;
      const [lng2, lat2] = event.endCoords;
      const distance = calculateDistance(lat1, lng1, lat2, lng2);
      totalDistance += distance;
    }
    
    // Count provinces/locations visited
    if (event.coordinates && event.coordinates.end) {
      const endLocation = event.coordinates.end;
      if (endLocation.province) {
        visitedProvinces.add(endLocation.province);
      }
    }
    
    // Count prison years - search in event description
    const eventText = String(event.event).toLowerCase();
    if (eventText.includes('prison') || eventText.includes('imprisoned') || 
        eventText.includes('arrested') || eventText.includes('incarcerated') ||
        eventText.includes('robben island') || eventText.includes('pollsmoor')) {
      prisonYears++;
    }
    
    // Count international trips - check if location is outside South Africa
    if (event.coordinates && event.coordinates.end) {
      const endProvince = event.coordinates.end.province;
      // Check if the province is not a known South African province
      const saProvinces = ['Western Cape', 'Eastern Cape', 'Northern Cape', 'Free State', 
                           'KwaZulu-Natal', 'Gauteng', 'Limpopo', 'Mpumalanga', 'North West'];
      if (endProvince && !saProvinces.includes(endProvince)) {
        internationalTrips++;
      }
    }
  }
  
  // Update UI with animation
  updateStatsWithAnimation({
    distance: Math.round(totalDistance),
    provinces: visitedProvinces.size,
    prison: prisonYears,
    international: internationalTrips
  });
}

/**
 * 计算两点之间的距离（Haversine公式）
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 地球半径，单位公里
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * 更新事件标记
 */
function updateEventMarkers(targetIndex) {
  eventMarkers.forEach((marker) => map.removeLayer(marker));
  eventMarkers = [];
  locationMarkers.clear();

  locationGroups = groupEventsByLocation(trajectoryData.events, targetIndex);

  const currentEvent = trajectoryData.events[targetIndex];
  const currentCoordKey = currentEvent.endCoords
    ? `${currentEvent.endCoords[0]},${currentEvent.endCoords[1]}`
    : null;

  locationGroups.forEach((locationGroup, coordKey) => {
    const isCurrent = coordKey === currentCoordKey;
    const isVisited = !isCurrent;

    const marker = createLocationMarker(locationGroup, isCurrent, isVisited);

    if (marker) {
      marker.addTo(map);
      eventMarkers.push(marker);
      locationMarkers.set(coordKey, marker);
    }
  });

  setTimeout(() => {
    ensureMarkersInteractivity();
  }, 100);
}

/**
 * 确保标记交互性正常工作
 */
function ensureMarkersInteractivity() {
  eventMarkers.forEach((marker) => {
    if (marker._icon) {
      const zIndex = Math.abs(parseInt(marker._icon.style.zIndex) || 0) || 1000;
      marker._icon.style.zIndex = zIndex;

      marker._icon.style.pointerEvents = "auto";
      marker._icon.style.cursor = "pointer";

      if (!marker._hasInteractivityEnsured) {
        marker._hasInteractivityEnsured = true;

        const originalOnClick = marker._originalClickHandler;
        if (originalOnClick) {
          marker.off("click");
          marker.on("click", originalOnClick);
        }
      }
    }
  });

  if (map && map.invalidateSize) {
    map.invalidateSize({
      animate: false,
      pan: false,
    });
  }
}

// ==================== 动画控制 ====================
/**
 * 显示指定索引的事件
 */
function showEventAtIndex(index, animated = true, isUserDrag = false) {
  if (!trajectoryData || index >= trajectoryData.events.length || index < 0)
    return;
  if (animationConfig.isAnimating && !isUserDrag) return;

  const isMovingForward = index > currentEventIndex;
  const isMovingBackward = index < currentEventIndex;

  previousEventIndex = currentEventIndex;
  currentEventIndex = index;
  const event = trajectoryData.events[index];

  if (animated && (isMovingForward || isMovingBackward)) {
    animationConfig.isAnimating = true;
    setTimeout(() => {
      animationConfig.isAnimating = false;
    }, animationConfig.pathDuration + 100);
  }

  updateCurrentEventInfo(event);
  updateProgress();
  updateEventMarkers(index);
  updateJourneyStats(index); // Update journey statistics
  
  // Update current location marker with animated tracking lines
  updateCurrentLocationMarker(event, previousEventIndex);
  
  // Trigger WOW effects on event play
  setTimeout(() => {
    checkMilestoneAndTriggerEffects(event);
  }, 300);

  if (animated && (isMovingForward || isMovingBackward)) {
    updatePathsAnimated(index, isMovingBackward);
  } else {
    updatePathsStatic(index);
  }

  if (isCameraFollowEnabled) {
    handleCameraFollow(event, previousEventIndex, animated);
  }

  if (animated) {
    setTimeout(() => {
      ensureMarkersInteractivity();
    }, animationConfig.pathDuration + 100);
  }
}

// ==================== 镜头跟随控制 ====================
/**
 * 处理镜头跟随逻辑
 */
function handleCameraFollow(currentEvent, previousIndex, animated = true) {
  if (!currentEvent) return;

  const bounds = calculatePathBounds(currentEvent, previousIndex);
  if (bounds && bounds.isValid()) {
    const panOptions = {
      animate: animated,
      duration: animated ? animationConfig.cameraFollowDuration / 1000 : 0, // 镜头时长
      paddingTopLeft: [50, 50],
      paddingBottomRight: [50, 100],
      maxZoom: 8,
      easeLinearity: 0.5,
    };

    map.fitBounds(bounds, panOptions);
  } else if (currentEvent.endCoords) {
    const [lng, lat] = currentEvent.endCoords;
    const panOptions = {
      animate: animated,
      duration: animated ? animationConfig.cameraPanDuration / 1000 : 0, // 平移时长
      easeLinearity: 0.5,
    };
    map.setView([lat, lng], Math.max(map.getZoom(), 6), panOptions);
  }
}

/**
 * 计算路径边界框
 */
function calculatePathBounds(currentEvent, previousIndex) {
  const coordinates = [];

  if (previousIndex >= 0 && trajectoryData.events[previousIndex]) {
    const prevEvent = trajectoryData.events[previousIndex];
    if (prevEvent.endCoords) {
      coordinates.push([prevEvent.endCoords[1], prevEvent.endCoords[0]]);
    }
  }

  if (currentEvent.startCoords) {
    coordinates.push([
      currentEvent.startCoords[1],
      currentEvent.startCoords[0],
    ]);
  }

  if (currentEvent.transitCoords && currentEvent.transitCoords.length > 0) {
    currentEvent.transitCoords.forEach((coords) => {
      if (coords && coords.length === 2) {
        coordinates.push([coords[1], coords[0]]);
      }
    });
  }

  if (currentEvent.endCoords) {
    coordinates.push([currentEvent.endCoords[1], currentEvent.endCoords[0]]);
  }

  if (coordinates.length === 1) {
    const [lat, lng] = coordinates[0];
    const offset = 0.1;
    coordinates.push([lat + offset, lng + offset]);
    coordinates.push([lat - offset, lng - offset]);
  }

  if (coordinates.length >= 2) {
    try {
      return L.latLngBounds(coordinates);
    } catch (error) {
      console.warn("计算边界框失败:", error);
      return null;
    }
  }

  return null;
}

/**
 * 切换镜头跟随状态
 */
function toggleCameraFollow() {
  isCameraFollowEnabled = !isCameraFollowEnabled;
  updateCameraFollowUI();

  try {
    localStorage.setItem(
      "cameraFollowEnabled",
      isCameraFollowEnabled.toString()
    );
  } catch (error) {
    console.warn("无法保存镜头跟随设置:", error);
  }
}

/**
 * 更新镜头跟随UI状态
 */
function updateCameraFollowUI() {
  const cameraSwitch = document.getElementById("camera-follow-switch");
  const cameraStatus = document.getElementById("camera-follow-status");

  if (cameraSwitch) {
    if (isCameraFollowEnabled) {
      cameraSwitch.classList.add("active");
    } else {
      cameraSwitch.classList.remove("active");
    }
  }

  if (cameraStatus) {
    cameraStatus.textContent = isCameraFollowEnabled ? "开启" : "关闭";
  }
}

/**
 * 初始化镜头跟随控制
 */
function initCameraFollowControl() {
  try {
    const saved = localStorage.getItem("cameraFollowEnabled");
    if (saved !== null) {
      isCameraFollowEnabled = saved === "true";
    }
  } catch (error) {
    console.warn("无法读取镜头跟随设置:", error);
  }

  const cameraSwitch = document.getElementById("camera-follow-switch");
  if (cameraSwitch) {
    cameraSwitch.addEventListener("click", toggleCameraFollow);
  }

  updateCameraFollowUI();
}

// ==================== 路径高亮功能 ====================
/**
 * 高亮指定事件的路径
 */
function highlightEventPath(eventIndex) {
  if (
    !trajectoryData ||
    eventIndex < 0 ||
    eventIndex >= trajectoryData.events.length
  ) {
    return;
  }

  clearPathHighlight();

  const motionPath = motionPaths.get(eventIndex);

  if (motionPath && motionPath._map) {
    const originalStyle = {
      color: motionPath.options.color,
      weight: motionPath.options.weight,
      opacity: motionPath.options.opacity,
      dashArray: motionPath.options.dashArray,
    };

    motionPath.setStyle({
      color: "#e74c3c",
      weight: 5,
      opacity: 0.9,
      dashArray: "10, 0",
    });

    motionPath.motionStart();

    highlightedPaths.push({
      path: motionPath,
      originalStyle: originalStyle,
    });

    currentHighlightedEventIndex = eventIndex;

    if (highlightTimeout) {
      clearTimeout(highlightTimeout);
    }

    highlightTimeout = setTimeout(() => {
      clearPathHighlight();
    }, 4000);

    // 聚焦到路径
    if (motionPath.getBounds && isCameraFollowEnabled) {
      try {
        const bounds = motionPath.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 8,
            animate: true,
            duration: animationConfig.cameraFollowDuration / 1000, // 镜头时长
            easeLinearity: 0.5,
          });
        }
      } catch (error) {
        console.warn("聚焦路径失败:", error);
      }
    }
  }
}

/**
 * 清除路径高亮
 */
function clearPathHighlight() {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
    highlightTimeout = null;
  }

  highlightedPaths.forEach(({ path, originalStyle }) => {
    if (path && path._map) {
      try {
        path.setStyle(originalStyle);
        path.motionStart();
      } catch (error) {
        console.warn("恢复路径样式失败:", error);
      }
    }
  });

  highlightedPaths = [];
  currentHighlightedEventIndex = -1;
}

/**
 * 快速清除路径高亮
 */
function quickClearPathHighlight() {
  if (highlightTimeout) {
    clearTimeout(highlightTimeout);
    highlightTimeout = null;
  }

  highlightedPaths.forEach(({ path, originalStyle }) => {
    if (path && path._map) {
      try {
        path.setStyle({
          ...originalStyle,
          opacity: originalStyle.opacity * 0.3,
        });

        setTimeout(() => {
          if (path && path._map) {
            path.setStyle(originalStyle);
            path.motionStart();
          }
        }, 200);
      } catch (error) {
        console.warn("快速清除路径高亮失败:", error);
      }
    }
  });

  highlightedPaths = [];
  currentHighlightedEventIndex = -1;
}

// ==================== UI更新 ====================
/**
 * 更新当前事件信息显示
 */
function updateCurrentEventInfo(event) {
  const pcElements = {
    "event-date": event.date,
    "event-title": event.event,
    "event-location": event.endLocation,
    "current-age": event.age,
  };

  Object.entries(pcElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const mobileElements = {
    "event-date-mobile": event.date,
    "event-title-mobile": event.event,
    "event-location-mobile": event.endLocation,
    "current-age-mobile": event.age,
  };

  Object.entries(mobileElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

/**
 * 更新进度信息
 */
function updateProgress() {
  const progress = trajectoryData
    ? ((currentEventIndex + 1) / trajectoryData.events.length) * 100
    : 0;

  const mobileElements = {
    "current-progress-mobile": progress.toFixed(1) + "%",
    "current-event-index-mobile": currentEventIndex + 1,
  };

  Object.entries(mobileElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const desktopElements = {
    "current-progress-desktop": progress.toFixed(1) + "%",
    "current-event-index-desktop": currentEventIndex + 1,
    "current-age-desktop": trajectoryData.events[currentEventIndex].age,
  };

  Object.entries(desktopElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });

  const slider = document.getElementById("timeline-slider");
  if (slider && !slider.matches(":active")) {
    slider.value = currentEventIndex;
  }
}

/**
 * 更新统计数据
 */
function updateStatistics() {
  if (!trajectoryData || !trajectoryData.events) return;

  const locale = i18n.getCurrentLocale();
  const events = trajectoryData.events;

  // 根据语言选择对应的movementType值
  const birthType = locale === 'en' ? 'Birth' : '出生';
  const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';
  const internationalType = locale === 'en' ? 'International Movement' : '国际移动';

  const movementEvents = events.filter(
    (e) => e.movementType !== birthType && e.movementType !== localActivityType
  );
  const internationalEvents = events.filter(
    (e) => e.movementType === internationalType
  );

  const visitedPlaces = new Set();
  events.forEach((event) => {
    if (event.endLocation) {
      let location = event.endLocation;
      const provinceKeyword = locale === 'en' ? 'Province' : '省';
      const cityKeyword = locale === 'en' ? 'City' : '市';

      if (location.includes(provinceKeyword)) {
        location = location.split(provinceKeyword)[0] + provinceKeyword;
      } else if (location.includes(cityKeyword)) {
        location = location.split(cityKeyword)[0] + cityKeyword;
      }
      visitedPlaces.add(location);
    }
  });

  const startYear = parseInt(events[0].date.split("-")[0]);
  const endYear = parseInt(events[events.length - 1].date.split("-")[0]);
  const timeSpan = endYear - startYear;
  const yearSuffix = locale === 'en' ? ' years' : '年';

  const pcStats = {
    "total-events": events.length,
    "movement-count": movementEvents.length,
    "visited-places": visitedPlaces.size,
    "international-count": internationalEvents.length,
    "time-span": timeSpan + yearSuffix,
  };

  Object.entries(pcStats).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  });
}

// ==================== 播放控制 ====================
/**
 * 切换播放/暂停状态
 */
function togglePlay() {
  const btn = document.getElementById("play-btn");
  if (!btn) return;

  if (isPlaying) {
    isPlaying = false;
    if (playInterval) {
      clearTimeout(playInterval);
      playInterval = null;
    }
    btn.textContent = "▶";
    btn.title = "播放";
  } else {
    isPlaying = true;
    btn.textContent = "⏸";
    btn.title = "暂停";

    playNextEvent();
  }
}

/**
 * 递归播放下一个事件
 */
function playNextEvent() {
  if (!isPlaying || currentEventIndex >= trajectoryData.events.length - 1) {
    isPlaying = false;
    const btn = document.getElementById("play-btn");
    if (btn) {
      btn.textContent = "▶";
      btn.title = "播放";
    }
    return;
  }

  const nextIndex = currentEventIndex + 1;
  const isLastEvent = nextIndex >= trajectoryData.events.length - 1;

  showEventAtIndex(nextIndex, true);

  if (isLastEvent) {
    isPlaying = false;
    const btn = document.getElementById("play-btn");
    if (btn) {
      btn.textContent = "▶";
      btn.title = "播放";
    }
    showPoetryMessage();
    return;
  }

  const waitTime = Math.max(
    currentPlaySpeed,
    animationConfig.pathDuration + 200
  );

  playInterval = setTimeout(() => {
    playNextEvent();
  }, waitTime);
}

/**
 * 下一个事件
 */
function nextEvent() {
  if (currentEventIndex < trajectoryData.events.length - 1) {
    showEventAtIndex(currentEventIndex + 1, true, true);
  }
}

/**
 * 上一个事件
 */
function previousEvent() {
  if (currentEventIndex > 0) {
    showEventAtIndex(currentEventIndex - 1, true, true);
  }
}

// ==================== 键盘控制 ====================
/**
 * 统一的键盘事件处理函数
 */
function handleTimelineKeydown(e) {
  if (!trajectoryData || !trajectoryData.events) return;

  let newIndex = currentEventIndex;
  let handled = false;

  switch (e.key) {
    case "ArrowLeft":
    case "ArrowDown":
      newIndex = Math.max(0, currentEventIndex - 1);
      handled = true;
      break;
    case "ArrowRight":
    case "ArrowUp":
      newIndex = Math.min(
        trajectoryData.events.length - 1,
        currentEventIndex + 1
      );
      handled = true;
      break;
    case "Home":
      newIndex = 0;
      handled = true;
      break;
    case "End":
      newIndex = trajectoryData.events.length - 1;
      handled = true;
      break;
    case " ":
      e.preventDefault();
      togglePlay();
      return;
  }

  if (handled) {
    e.preventDefault();
    if (newIndex !== currentEventIndex) {
      showEventAtIndex(newIndex, true, true);
    }
  }
}

// ==================== 动画设置控制 ====================
/**
 * 初始化动画控制滑块
 */
function initAnimationControls() {
  const pathDurationSlider = document.getElementById("path-duration");
  const pathDurationDisplay = document.getElementById("path-duration-display");
  const cameraSpeedSlider = document.getElementById("camera-speed-slider");
  const cameraSpeedDisplay = document.getElementById("camera-speed-display");

  if (pathDurationSlider && pathDurationDisplay) {
    pathDurationSlider.value = animationConfig.pathDuration;
    pathDurationDisplay.textContent =
      (animationConfig.pathDuration / 1000).toFixed(1) + "s";

    pathDurationSlider.addEventListener("input", (e) => {
      const newDuration = parseInt(e.target.value);
      animationConfig.pathDuration = newDuration;

      if (currentPlaySpeed < newDuration) {
        currentPlaySpeed = newDuration + 500;
        updateSpeedUI();
      }

      pathDurationDisplay.textContent = (newDuration / 1000).toFixed(1) + "s";
      updateAnimationDuration(newDuration);
    });
  }

  if (cameraSpeedSlider && cameraSpeedDisplay) {
    // 从本地存储恢复设置
    let savedSpeedLevel = 1;
    try {
      const saved = localStorage.getItem("cameraSpeedLevel");
      if (saved !== null) {
        savedSpeedLevel = parseInt(saved);
        if (
          savedSpeedLevel < 0 ||
          savedSpeedLevel >= CAMERA_SPEED_LEVELS.length
        ) {
          savedSpeedLevel = 1;
        }
      }
    } catch (error) {
      console.warn("无法读取镜头速度设置:", error);
    }

    cameraSpeedSlider.value = savedSpeedLevel;
    updateCameraSpeed(savedSpeedLevel);

    cameraSpeedSlider.addEventListener("input", (e) => {
      const levelIndex = parseInt(e.target.value);
      updateCameraSpeed(levelIndex);

      try {
        localStorage.setItem("cameraSpeedLevel", levelIndex.toString());
      } catch (error) {
        console.warn("无法保存镜头速度设置:", error);
      }
    });
  }
}

/**
 * 更新镜头速度配置
 */
function updateCameraSpeed(levelIndex) {
  if (levelIndex < 0 || levelIndex >= CAMERA_SPEED_LEVELS.length) {
    console.warn("无效的镜头速度档位:", levelIndex);
    return;
  }

  const speedConfig = CAMERA_SPEED_LEVELS[levelIndex];
  const cameraSpeedDisplay = document.getElementById("camera-speed-display");

  animationConfig.cameraFollowDuration = speedConfig.cameraFollowDuration;
  animationConfig.cameraPanDuration = speedConfig.cameraPanDuration;

  if (cameraSpeedDisplay) {
    cameraSpeedDisplay.textContent = i18n.t(speedConfig.name);
  }

  console.log(`镜头跟随速度已调整为: ${i18n.t(speedConfig.name)}`, {
    跟随时长: speedConfig.cameraFollowDuration + "ms",
    平移时长: speedConfig.cameraPanDuration + "ms",
  });
}

/**
 * 更新动画时长配置
 */
function updateAnimationDuration(duration) {
  document.documentElement.style.setProperty(
    "--path-animation-duration",
    duration + "ms"
  );
}

// 更新播放速度UI
function updateSpeedUI() {
  const speedSelect = document.getElementById("custom-speed-select");
  if (speedSelect) {
    speedSelect.dataset.value = currentPlaySpeed.toString();
    const selectText = speedSelect.querySelector(".select-text");
    if (selectText) {
      selectText.textContent = getSpeedLabel(currentPlaySpeed);
    }
  }
}

/**
 * 获取速度标签
 */
function getSpeedLabel(speed) {
  const speedLabels = {
    500: "极快",
    1000: "快速",
    2000: "正常",
    3000: "慢速",
    5000: "极慢",
  };
  return speedLabels[speed] || `${speed}ms`;
}

/**
 * 复制当前事件数据到剪贴板
 */
function copyCurrentEventData() {
  if (!trajectoryData || !trajectoryData.events || currentEventIndex < 0) {
    showTemporaryMessage(i18n.t('messages.noEventData'), "warning");
    return;
  }

  try {
    const currentEvent = trajectoryData.events[currentEventIndex];

    const cleanEventData = {
      date: currentEvent.date,
      age: currentEvent.age,
      movementType: currentEvent.movementType,
      event: currentEvent.event,
      coordinates: currentEvent.coordinates,
      verification: currentEvent.verification || "",
      userVerification: currentEvent.userVerification || [],
    };

    if (cleanEventData.userVerification.length === 0) {
      cleanEventData.userVerification = [
        {
          username: "考据者署名 (可选)",
          comment: "考据补充或感言 (可选)",
          date: "考据日期 (可选)",
        },
      ];
    }

    const jsonString = JSON.stringify(cleanEventData, null, 2);

    const formattedJson = `    ${jsonString.replace(/\n/g, "\n    ")},`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(formattedJson)
        .then(() => {
          const eventNumber = currentEventIndex + 1;
          showTemporaryMessage(
            i18n.t('messages.copySuccess', { number: eventNumber }),
            "success"
          );
        })
        .catch(() => {
          fallbackCopyToClipboard(formattedJson);
        });
    } else {
      fallbackCopyToClipboard(formattedJson);
    }
  } catch (error) {
    console.error("复制事件数据时出错:", error);
    showTemporaryMessage(i18n.t('messages.copyFailed'), "warning");
  }
}

/**
 * 兼容性剪贴板复制方案
 */
function fallbackCopyToClipboard(text) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);

    if (successful) {
      const eventNumber = currentEventIndex + 1;
      showTemporaryMessage(i18n.t('messages.copySuccess', { number: eventNumber }), "success");
    } else {
      showTemporaryMessage(i18n.t('messages.copyManual'), "warning");
    }
  } catch (err) {
    console.error("传统复制方法也失败:", err);
    showTemporaryMessage(i18n.t('messages.copyNotSupported'), "warning");
  }
}

/**
 * 隐藏加载提示
 */
function hideLoading() {
  const loading = document.getElementById("loading");
  if (loading) {
    loading.style.display = "none";
  }
}

// ==================== 自定义下拉选择器 ====================
/**
 * 初始化自定义速度选择器
 */
function initCustomSpeedSelect() {
  const customSelect = document.getElementById("custom-speed-select");
  if (!customSelect) return;

  const selectDisplay = customSelect.querySelector(".select-display");
  const selectText = customSelect.querySelector(".select-text");
  const selectDropdown = customSelect.querySelector(".select-dropdown");
  const selectOptions = customSelect.querySelectorAll(".select-option");

  let isOpen = false;

  function openDropdown() {
    if (isOpen) return;

    isOpen = true;
    customSelect.classList.add("open");

    setTimeout(() => {
      document.addEventListener("click", handleDocumentClick);
    }, 0);
  }

  function closeDropdown() {
    if (!isOpen) return;

    isOpen = false;
    customSelect.classList.remove("open");
    document.removeEventListener("click", handleDocumentClick);
  }

  function handleDocumentClick(e) {
    if (!customSelect.contains(e.target)) {
      closeDropdown();
    }
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  }

  function selectOption(option) {
    const value = option.dataset.value;
    const i18nKey = option.getAttribute('data-i18n');
    const text = i18nKey ? i18n.t(i18nKey) : option.textContent;

    selectText.textContent = text;

    customSelect.dataset.value = value;

    selectOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");

    currentPlaySpeed = parseInt(value);

    if (isPlaying) {
      togglePlay();
      setTimeout(() => togglePlay(), 100);
    }

    closeDropdown();
  }

  if (selectDisplay) {
    selectDisplay.addEventListener("click", toggleDropdown);
  }

  selectOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      selectOption(option);
    });
  });

  customSelect.addEventListener("keydown", (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openDropdown();
      }
    } else {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          closeDropdown();
          break;
        case "ArrowUp":
          e.preventDefault();
          navigateOptions(-1);
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateOptions(1);
          break;
        case "Enter":
          e.preventDefault();
          const selectedOption = selectDropdown.querySelector(
            ".select-option.selected"
          );
          if (selectedOption) {
            selectOption(selectedOption);
          }
          break;
      }
    }
  });

  function navigateOptions(direction) {
    const options = Array.from(selectOptions);
    const currentIndex = options.findIndex((opt) =>
      opt.classList.contains("selected")
    );
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = options.length - 1;
    if (newIndex >= options.length) newIndex = 0;

    options.forEach((opt) => opt.classList.remove("selected"));
    options[newIndex].classList.add("selected");
  }

  customSelect.setAttribute("tabindex", "0");

  const initialValue = customSelect.dataset.value || "1000";
  const initialOption = customSelect.querySelector(
    `[data-value="${initialValue}"]`
  );
  if (initialOption) {
    const i18nKey = initialOption.getAttribute('data-i18n');
    selectText.textContent = i18nKey ? i18n.t(i18nKey) : initialOption.textContent;
    selectOptions.forEach((opt) => opt.classList.remove("selected"));
    initialOption.classList.add("selected");
  }

  // 创建更新函数，供语言切换时调用
  window.updateSpeedSelect = function() {
    const currentOption = customSelect.querySelector(".select-option.selected");
    if (currentOption) {
      const i18nKey = currentOption.getAttribute('data-i18n');
      if (i18nKey) {
        selectText.textContent = i18n.t(i18nKey);
      }
    }
  };
}

// ==================== Music Playback Function ====================
const MUSIC_PLAYLIST = [
  {
    id: "internationale",
    title: "Internationale",
    artist: "Internationale",
    duration: "03:45",
    urls: [
      "data/music/Internationale-cmn_(英特纳雄耐尔).ogg",
    ],
  },
  {
    id: "east_is_red",
    title: "The East Is Red",
    artist: "East Is Red (1950)",
    duration: "04:30",
    urls: [
      "data/music/东方红_-_The_East_Is_Red_(1950).ogg",
    ],
  },
];

/**
 * 清理音频事件监听器
 */
function cleanupMusicEventListeners() {
  if (!musicAudio) return;

  console.log("清理音频事件监听器");

  const eventsToClean = [
    "loadedmetadata",
    "canplaythrough",
    "error",
    "loadstart",
    "loadeddata",
  ];

  eventsToClean.forEach((eventType) => {
    musicAudio.removeEventListener(eventType, () => {});
  });

  currentAudioEventListeners.clear();
}

/**
 * 等待音频准备就绪后自动播放
 */
function autoPlayWhenReady(shouldPlay = true) {
  if (!musicAudio || !shouldPlay) {
    isAutoPlayPending = false;
    return Promise.resolve(false);
  }

  isAutoPlayPending = true;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      console.warn("音频加载超时，取消自动播放");
      isAutoPlayPending = false;
      cleanup();
      resolve(false);
    }, 10000);

    const cleanup = () => {
      clearTimeout(timeoutId);
      musicAudio.removeEventListener("canplaythrough", handleCanPlay);
      musicAudio.removeEventListener("loadedmetadata", handleCanPlay);
      musicAudio.removeEventListener("error", handleError);
    };

    const handleCanPlay = () => {
      cleanup();

      if (isAutoPlayPending) {
        console.log("音频准备就绪，开始自动播放");
        musicAudio
          .play()
          .then(() => {
            isMusicPlaying = true;
            startProgressUpdate();
            updatePlayButton();
            updateMusicBtnState();
            updateTimelineControlBackground();
            isAutoPlayPending = false;
            resolve(true);
          })
          .catch((error) => {
            console.warn("自动播放失败:", error);
            isAutoPlayPending = false;
            updatePlayButton();
            updateMusicBtnState();
            updateTimelineControlBackground();
            resolve(false);
          });
      } else {
        resolve(false);
      }
    };

    const handleError = (error) => {
      console.warn("音频加载出错，取消自动播放:", error);
      cleanup();
      isAutoPlayPending = false;
      resolve(false);
    };

    // 检查音频是否已经可以播放
    if (musicAudio.readyState >= 3) {
      cleanup();
      handleCanPlay();
    } else {
      musicAudio.addEventListener("canplaythrough", handleCanPlay, {
        once: true,
      });
      musicAudio.addEventListener("loadedmetadata", handleCanPlay, {
        once: true,
      });
      musicAudio.addEventListener("error", handleError, { once: true });
    }
  });
}

/**
 * 加载音频文件
 */
function loadMusicAudio(song, autoPlay = false) {
  if (!musicAudio) return Promise.resolve(false);

  console.log(`加载音频: ${song.title}, 自动播放: ${autoPlay}`);

  isAutoPlayPending = false;

  if (isMusicPlaying) {
    musicAudio.pause();
    isMusicPlaying = false;
    clearInterval(musicProgressInterval);
  }

  cleanupMusicEventListeners();

  musicAudio.currentTime = 0;
  updateMusicProgress();
  updatePlayButton();
  updateMusicBtnState();

  let urlIndex = 0;

  function tryLoadUrl() {
    return new Promise((resolve) => {
      if (urlIndex >= song.urls.length) {
        console.warn("无法加载音频文件:", song.title);
        showTemporaryMessage(i18n.t('messages.musicLoadError'), "warning");
        resolve(false);
        return;
      }

      const url = song.urls[urlIndex];
      console.log("尝试加载音频:", url);

      const loadTimeoutId = setTimeout(() => {
        console.warn("音频加载超时:", url);
        handleLoadError();
      }, 8000);

      const cleanup = () => {
        clearTimeout(loadTimeoutId);
        musicAudio.removeEventListener("canplaythrough", handleLoadSuccess);
        musicAudio.removeEventListener("loadedmetadata", handleLoadSuccess);
        musicAudio.removeEventListener("error", handleLoadError);
      };

      const handleLoadSuccess = () => {
        console.log("音频加载成功:", url);
        cleanup();

        updatePlayButton();
        updateMusicBtnState();

        if (autoPlay) {
          autoPlayWhenReady(true).then((success) => {
            resolve(success);
          });
        } else {
          resolve(true);
        }
      };

      const handleLoadError = () => {
        console.warn("音频加载失败:", url);
        cleanup();
        urlIndex++;
        tryLoadUrl().then(resolve);
      };

      musicAudio.addEventListener("canplaythrough", handleLoadSuccess, {
        once: true,
      });
      musicAudio.addEventListener("loadedmetadata", handleLoadSuccess, {
        once: true,
      });
      musicAudio.addEventListener("error", handleLoadError, { once: true });

      musicAudio.src = url;
      musicAudio.volume = musicVolume;
      musicAudio.load();
    });
  }

  audioLoadingPromise = tryLoadUrl();
  return audioLoadingPromise;
}

/**
 * 播放上一首
 */
function playPreviousSong() {
  const prevIndex =
    currentMusicIndex > 0 ? currentMusicIndex - 1 : MUSIC_PLAYLIST.length - 1;
  const wasPlaying = isMusicPlaying;

  console.log(`播放上一首: 索引 ${prevIndex}, 之前在播放: ${wasPlaying}`);

  selectSong(prevIndex, wasPlaying);
}

/**
 * 播放下一首
 */
function playNextSong() {
  const nextIndex =
    currentMusicIndex < MUSIC_PLAYLIST.length - 1 ? currentMusicIndex + 1 : 0;
  const wasPlaying = isMusicPlaying;

  console.log(`播放下一首: 索引 ${nextIndex}, 之前在播放: ${wasPlaying}`);

  selectSong(nextIndex, wasPlaying);
}

/**
 * 选择歌曲
 */
function selectSong(index, autoPlay = false) {
  if (index < 0 || index >= MUSIC_PLAYLIST.length) return;

  console.log(`选择歌曲: 索引 ${index}, 自动播放: ${autoPlay}`);

  currentMusicIndex = index;
  const song = MUSIC_PLAYLIST[index];

  const titleEl = document.getElementById("current-song-title");
  const artistEl = document.getElementById("current-song-artist");

  if (titleEl) titleEl.textContent = song.title;
  if (artistEl) artistEl.textContent = song.artist;

  const playlistItems = document.querySelectorAll(".playlist-item");
  playlistItems.forEach((item, i) => {
    if (i === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  loadMusicAudio(song, autoPlay);
}

/**
 * 切换播放/暂停
 */
function toggleMusicPlay() {
  if (!musicAudio) return;

  if (isMusicPlaying) {
    console.log("暂停音乐播放");
    musicAudio.pause();
    isMusicPlaying = false;
    clearInterval(musicProgressInterval);
    updatePlayButton();
    updateMusicBtnState();
    updateTimelineControlBackground();
  } else {
    console.log("开始音乐播放");
    const playBtn = document.getElementById("music-play-btn");
    if (playBtn) {
      playBtn.textContent = "⏳";
      playBtn.title = "加载中...";
    }

    if (musicAudio.readyState < 3) {
      console.log("音频未准备好，等待加载...");
      autoPlayWhenReady(true);
    } else {
      console.log("音频已准备好，直接播放");
      musicAudio
        .play()
        .then(() => {
          isMusicPlaying = true;
          startProgressUpdate();
          updatePlayButton();
          updateMusicBtnState();
          updateTimelineControlBackground();
        })
        .catch((error) => {
          console.error("音频播放失败:", error);
          showTemporaryMessage(i18n.t('messages.musicPlayFailed'), "warning");

          isMusicPlaying = false;
          updatePlayButton();
          updateMusicBtnState();
        });
    }
  }
}

/**
 * 处理音乐播放结束
 */
function handleMusicEnded() {
  console.log("音乐播放结束，准备播放下一首");

  isMusicPlaying = false;
  clearInterval(musicProgressInterval);
  updatePlayButton();
  updateMusicBtnState();
  updateTimelineControlBackground();

  // 自动播放下一首
  setTimeout(() => {
    const nextIndex =
      currentMusicIndex < MUSIC_PLAYLIST.length - 1 ? currentMusicIndex + 1 : 0;
    selectSong(nextIndex, true);
  }, 500);
}

/**
 * 初始化音乐播放功能
 */
function initMusicPlayer() {
  const musicBtn = document.getElementById("music-btn");
  const musicModal = document.getElementById("music-modal");
  const musicBackdrop = document.getElementById("music-backdrop");
  const musicClose = document.getElementById("music-modal-close");
  const musicAudioElement = document.getElementById("music-audio");

  musicAudio = musicAudioElement;

  if (musicBtn) {
    musicBtn.addEventListener("click", showMusicModal);
  }

  if (musicClose) {
    musicClose.addEventListener("click", hideMusicModal);
  }

  if (musicBackdrop) {
    musicBackdrop.addEventListener("click", hideMusicModal);
  }

  if (musicModal) {
    musicModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  initMusicControls();
  initMusicPlaylist();
  initMusicUpload();
  initVolumeControl();

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMusicModalVisible) {
      hideMusicModal();
    }
  });
}

/**
 * 显示音乐弹窗
 */
function showMusicModal() {
  const musicModal = document.getElementById("music-modal");
  const musicBackdrop = document.getElementById("music-backdrop");

  if (musicModal && musicBackdrop) {
    musicBackdrop.classList.add("visible");
    musicModal.classList.add("visible");
    isMusicModalVisible = true;

    document.body.style.overflow = "hidden";
  }
}

/**
 * 隐藏音乐弹窗
 */
function hideMusicModal() {
  const musicModal = document.getElementById("music-modal");
  const musicBackdrop = document.getElementById("music-backdrop");

  if (musicModal && musicBackdrop) {
    musicBackdrop.classList.remove("visible");
    musicModal.classList.remove("visible");
    isMusicModalVisible = false;

    document.body.style.overflow = "";
  }
}

/**
 * 初始化音乐播放控制
 */
function initMusicControls() {
  const playBtn = document.getElementById("music-play-btn");
  const prevBtn = document.getElementById("music-prev-btn");
  const nextBtn = document.getElementById("music-next-btn");
  const progressBar = document.querySelector(".music-progress-bar");

  if (playBtn) {
    playBtn.addEventListener("click", toggleMusicPlay);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", playPreviousSong);
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", playNextSong);
  }

  if (progressBar) {
    progressBar.addEventListener("click", handleProgressClick);
  }

  if (!musicAudio) {
    musicAudio = document.getElementById("music-audio");
  }

  // 绑定基础事件监听器（这些不会被清理）
  if (musicAudio) {
    musicAudio.addEventListener("loadedmetadata", updateMusicDuration);
    musicAudio.addEventListener("timeupdate", updateMusicProgress);
    musicAudio.addEventListener("ended", handleMusicEnded);
    musicAudio.addEventListener("error", handleMusicError);
  }
}

/**
 * 初始化播放列表
 */
function initMusicPlaylist() {
  const playlistItems = document.getElementById("music-playlist-items");

  if (!playlistItems) return;

  playlistItems.innerHTML = "";

  MUSIC_PLAYLIST.forEach((song, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "playlist-item";
    itemEl.dataset.index = index;

    itemEl.innerHTML = `
      <div class="playlist-item-info">
        <div class="playlist-item-title">${song.title}</div>
        <div class="playlist-item-artist">${song.artist}</div>
      </div>
      <div class="playlist-item-duration">${song.duration}</div>
    `;

    itemEl.addEventListener("click", () => {
      const wasPlaying = isMusicPlaying;
      selectSong(index, wasPlaying); // 如果之前在播放，则自动播放新选择的歌曲
    });

    playlistItems.appendChild(itemEl);
  });

  if (MUSIC_PLAYLIST.length > 0) {
    selectSong(0, false); // 默认选择第一首，但不自动播放
  }
}

/**
 * 更新播放按钮状态
 */
function updatePlayButton() {
  const playBtn = document.getElementById("music-play-btn");
  if (playBtn) {
    if (isMusicPlaying) {
      playBtn.textContent = "⏸";
      playBtn.title = "暂停";
    } else {
      playBtn.textContent = "▶";
      playBtn.title = "播放";
    }
  }
}

/**
 * 更新音乐按钮状态
 */
function updateMusicBtnState() {
  const musicBtn = document.getElementById("music-btn");
  if (musicBtn) {
    if (isMusicPlaying) {
      musicBtn.classList.add("playing");
    } else {
      musicBtn.classList.remove("playing");
    }
  }
}

/**
 * 开始进度更新
 */
function startProgressUpdate() {
  musicProgressInterval = setInterval(() => {
    updateMusicProgress();
  }, 1000);
}

/**
 * 更新音乐进度
 */
function updateMusicProgress() {
  if (!musicAudio || !musicAudio.duration) return;

  const currentTime = musicAudio.currentTime;
  const duration = musicAudio.duration;
  const progress = (currentTime / duration) * 100;

  const progressFill = document.getElementById("music-progress-fill");
  if (progressFill) {
    progressFill.style.width = `${progress}%`;
  }

  const currentTimeEl = document.getElementById("music-current-time");
  const totalTimeEl = document.getElementById("music-total-time");

  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(currentTime);
  }

  if (totalTimeEl) {
    totalTimeEl.textContent = formatTime(duration);
  }
}

/**
 * 更新音乐总时长
 */
function updateMusicDuration() {
  if (!musicAudio || !musicAudio.duration) return;

  const totalTimeEl = document.getElementById("music-total-time");
  if (totalTimeEl) {
    totalTimeEl.textContent = formatTime(musicAudio.duration);
  }
}

/**
 * 处理进度条点击
 */
function handleProgressClick(e) {
  if (!musicAudio || !musicAudio.duration) return;

  const progressBar = e.currentTarget;
  const rect = progressBar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = x / rect.width;
  const newTime = percentage * musicAudio.duration;

  musicAudio.currentTime = newTime;
  updateMusicProgress();
}

/**
 * 处理音频错误
 */
function handleMusicError(e) {
  console.error("音频播放错误:", e);
  showTemporaryMessage(i18n.t('messages.musicPlayError'), "warning");

  isMusicPlaying = false;
  clearInterval(musicProgressInterval);
  updatePlayButton();
  updateMusicBtnState();
  updateTimelineControlBackground();
}

/**
 * 格式化时间显示
 */
function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

/**
 * 初始化音量控制
 */
function initVolumeControl() {
  const volumeSlider = document.getElementById("music-volume-slider");
  const volumeValue = document.getElementById("music-volume-value");

  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      const volume = parseInt(e.target.value) / 100;
      setMusicVolume(volume);
    });

    volumeSlider.value = musicVolume * 100;
  }

  if (volumeValue) {
    volumeValue.textContent = Math.round(musicVolume * 100) + "%";
  }
}

/**
 * 设置音乐音量
 */
function setMusicVolume(volume) {
  musicVolume = Math.max(0, Math.min(1, volume));

  if (musicAudio) {
    musicAudio.volume = musicVolume;
  }

  const volumeValue = document.getElementById("music-volume-value");
  if (volumeValue) {
    volumeValue.textContent = Math.round(musicVolume * 100) + "%";
  }

  try {
    localStorage.setItem("musicVolume", musicVolume.toString());
  } catch (error) {
    console.warn("无法保存音量设置:", error);
  }
}

/**
 * 初始化本地音乐上传
 */
function initMusicUpload() {
  const uploadBtn = document.getElementById("music-upload-btn");
  const fileInput = document.getElementById("music-file-input");

  if (uploadBtn) {
    uploadBtn.addEventListener("click", () => {
      fileInput?.click();
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", handleMusicFileUpload);
  }
}

/**
 * 处理本地音乐文件上传
 */
function handleMusicFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    showTemporaryMessage(i18n.t('messages.musicUploadError'), "warning");
    return;
  }

  const tempUrl = URL.createObjectURL(file);

  const tempSong = {
    id: "local_" + Date.now(),
    title: file.name.replace(/\.[^/.]+$/, ""),
    artist: "本地音乐",
    duration: "未知",
    urls: [tempUrl],
    isLocal: true,
  };

  MUSIC_PLAYLIST.push(tempSong);

  initMusicPlaylist();

  selectSong(MUSIC_PLAYLIST.length - 1, false); // 选择新上传的歌曲，但不自动播放

  showTemporaryMessage(i18n.t('messages.musicUploadSuccess'), "success");

  e.target.value = "";
}

/**
 * 从本地存储恢复音乐设置
 */
function restoreMusicSettings() {
  try {
    const savedVolume = localStorage.getItem("musicVolume");
    if (savedVolume !== null) {
      musicVolume = parseFloat(savedVolume);
      setMusicVolume(musicVolume);
    }
  } catch (error) {
    console.warn("无法读取音乐设置:", error);
  }
}

/**
 * 更新时间轴控制面板背景色
 */
function updateTimelineControlBackground() {
  const timelineControl = document.getElementById("timeline-control");

  if (timelineControl) {
    if (isMusicPlaying) {
      timelineControl.classList.add("music-playing");
    } else {
      timelineControl.classList.remove("music-playing");
    }
  }
}

// ==================== leaflet.motion 插件检查和性能优化 ====================
/**
 * 检查 leaflet.motion 插件是否正确加载
 */
function checkMotionPlugin() {
  if (
    typeof L.motion !== "undefined" &&
    typeof L.motion.polyline === "function"
  ) {
    console.log("✅ leaflet.motion 插件加载成功");
    return true;
  } else {
    console.error("❌ leaflet.motion 插件未正确加载");
    return false;
  }
}

/**
 * 清理 motion 资源
 */
function cleanupMotionResources() {
  const allPaths = Array.from(motionPaths.values());

  if (allPaths.length > 0) {
    batchAnimatePathsDisappear(allPaths, 100)
      .then(() => {
        motionPaths.clear();
        pathLayers = [];
        animationQueue = [];
        isAnimationInProgress = false;

        console.log("Motion 资源清理完成");
      })
      .catch((error) => {
        console.warn("Motion 资源清理失败:", error);
        motionPaths.forEach((path) => {
          if (path && path._map) {
            try {
              path.motionStop();
              map.removeLayer(path);
            } catch (e) {
              console.warn("强制清理路径失败:", e);
            }
          }
        });

        motionPaths.clear();
        pathLayers = [];
        animationQueue = [];
        isAnimationInProgress = false;
      });
  } else {
    motionPaths.clear();
    animationQueue = [];
    isAnimationInProgress = false;
    console.log("Motion 资源清理完成");
  }
}

/**
 * 预加载关键路径动画
 */
function preloadKeyAnimations() {
  if (!trajectoryData || !trajectoryData.events) return;

  // 获取当前语言环境的本地活动类型标识
  const locale = i18n.getCurrentLocale();
  const localActivityType = locale === 'en' ? 'Local Activity' : '原地活动';

  const keyEvents = trajectoryData.events.slice(
    0,
    Math.min(10, trajectoryData.events.length)
  );

  keyEvents.forEach((event, index) => {
    if (
      event.startCoords &&
      event.endCoords &&
      event.movementType !== localActivityType
    ) {
      const preloadPath = createMotionPath(
        event.startCoords,
        event.endCoords,
        event.transitCoords,
        false,
        index,
        false,
        false
      );

      if (preloadPath) {
        preloadPath.addTo(map);
        preloadPath.setStyle({ opacity: 0 });

        setTimeout(() => {
          if (preloadPath._map) {
            map.removeLayer(preloadPath);
          }
        }, 100);
      }
    }
  });

  console.log("关键路径预加载完成");
}

/**
 * 优化 motion 性能配置
 */
function optimizeMotionPerformance() {
  if (!map || !map._renderer) {
    console.warn("地图未完全初始化，跳过性能优化");
    return;
  }

  try {
    const renderer = map._renderer;
    if (renderer && renderer._container) {
      const container = renderer._container;

      container.style.willChange = "transform";
      container.style.transform = "translateZ(0)";
      container.style.backfaceVisibility = "hidden";

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeName === "path" && node.getAttribute("stroke")) {
                node.style.willChange = "stroke-dashoffset";
                node.style.transform = "translateZ(0)";
              }
            });
          }
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });

      window.motionObserver = observer;

      console.log("Motion 性能优化已启用");
    }
  } catch (error) {
    console.warn("Motion 性能优化失败:", error);
  }
}

/**
 * 动态调整 motion 参数
 */
function dynamicAdjustMotionParams() {
  const pathCount = motionPaths.size;
  const devicePixelRatio = window.devicePixelRatio || 1;
  const isMobile = isMobileDevice();

  let durationMultiplier = 1;

  if (pathCount > 20) {
    durationMultiplier = 0.7;
  } else if (pathCount > 10) {
    durationMultiplier = 0.85;
  }

  if (isMobile) {
    durationMultiplier *= 0.8;
  }

  if (devicePixelRatio > 2) {
    durationMultiplier *= 0.9;
  }

  animationConfig.pathDuration = Math.max(
    1000,
    animationConfig.pathDuration * durationMultiplier
  );
}

/**
 * 监听性能指标
 */
function monitorMotionPerformance() {
  let frameCount = 0;
  let lastTime = Date.now();
  let isMonitoring = false;

  function measureFPS() {
    if (!isMonitoring) return;

    frameCount++;
    const currentTime = Date.now();

    if (currentTime - lastTime >= 1000) {
      const fps = frameCount;
      frameCount = 0;
      lastTime = currentTime;

      // 如果 FPS 过低，自动调整参数
      if (fps < 30 && motionPaths.size > 0) {
        console.warn("Motion 性能较低，自动调整参数");
        dynamicAdjustMotionParams();
      }

      if (motionPaths.size > 0) {
        console.log(
          `Motion 性能监控 - FPS: ${fps}, 路径数量: ${motionPaths.size}`
        );
      }
    }

    if (motionPaths.size > 0 && isMonitoring) {
      requestAnimationFrame(measureFPS);
    }
  }

  isMonitoring = true;
  if (motionPaths.size > 0) {
    requestAnimationFrame(measureFPS);
  }

  return {
    stop: () => {
      isMonitoring = false;
    },
  };
}

// ==================== 事件绑定 ====================
/**
 * 绑定所有事件监听器
 */
function bindEvents() {
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  if (playBtn) playBtn.addEventListener("click", togglePlay);
  if (prevBtn) prevBtn.addEventListener("click", previousEvent);
  if (nextBtn) nextBtn.addEventListener("click", nextEvent);

  const slider = document.getElementById("timeline-slider");
  if (slider) {
    slider.addEventListener("mousedown", () => {
      isDragging = true;
      console.log("开始拖动 (mousedown)");
    });

    slider.addEventListener("touchstart", () => {
      isDragging = true;
      console.log("开始拖动 (touchstart)");
    });

    slider.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        console.log("结束拖动 (mouseup)");
        const finalIndex = parseInt(slider.value);
        if (finalIndex !== currentEventIndex) {
          showEventAtIndex(finalIndex, true, true);
        }
      }
    });

    slider.addEventListener("touchend", () => {
      if (isDragging) {
        isDragging = false;
        console.log("结束拖动 (touchend)");
        const finalIndex = parseInt(slider.value);
        if (finalIndex !== currentEventIndex) {
          showEventAtIndex(finalIndex, true, true);
        }
      }
    });

    slider.addEventListener("input", (e) => {
      if (trajectoryData) {
        const newIndex = parseInt(e.target.value);
        console.log(`滑块输入: ${newIndex}, 拖动状态: ${isDragging}`);

        if (isDragging) {
          showEventAtIndex(newIndex, false, true);
        } else {
          showEventAtIndex(newIndex, true, true);
        }
      }
    });

    slider.addEventListener("dblclick", (e) => {
      e.preventDefault();
      copyCurrentEventData();
    });

    slider.addEventListener("keydown", (e) => {
      handleTimelineKeydown(e);
    });

    slider.addEventListener("focus", () => {
      slider.style.outline = "none";
    });

    slider.addEventListener("click", () => {
      slider.focus();
    });
  }

  document.addEventListener("keydown", (e) => {
    const activeElement = document.activeElement;
    const isInputElement =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "SELECT" ||
        activeElement.contentEditable === "true");

    const detailPanel = document.getElementById("location-detail-panel");
    const isPanelVisible =
      detailPanel && detailPanel.classList.contains("visible");

    if (!isInputElement && !isPanelVisible) {
      handleTimelineKeydown(e);
    }
  });

  const speedSelect = document.getElementById("speed-select");
  if (speedSelect) {
    speedSelect.addEventListener("change", (e) => {
      currentPlaySpeed = parseInt(e.target.value);
      if (isPlaying) {
        togglePlay();
        setTimeout(() => togglePlay(), 100);
      }
    });
  }
  initCustomSpeedSelect();

  const speedBtns = document.querySelectorAll(".speed-btn");
  speedBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      speedBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPlaySpeed = parseInt(btn.dataset.speed);

      if (isPlaying) {
        togglePlay();
        setTimeout(() => togglePlay(), 100);
      }
    });
  });

  initAnimationControls();
  initStatsHover();
  initDetailPanel();
  initMobileInteractions();
  initFeedbackModal();
  initCameraFollowControl();
  initMusicPlayer();

  restoreMusicSettings();

  window.addEventListener("resize", () => {
    const mapEl = document.getElementById("map");
    if (isMobileDevice()) {
      if (isPanelVisible) {
        mapEl.classList.remove("panel-hidden");
        mapEl.classList.add("panel-visible");
      } else {
        mapEl.classList.remove("panel-visible");
        mapEl.classList.add("panel-hidden");
      }
    } else {
      mapEl.classList.remove("panel-hidden", "panel-visible");
      isPanelVisible = true;
      document.getElementById("timeline-control").classList.remove("hidden");
    }
  });
}

// ==================== Application Startup ====================
/**
 * Initialize application with English language only
 */
async function initApp() {
  try {
    console.log('Initializing Mandela Map application...');

    initMap();

    const motionLoaded = checkMotionPlugin();
    if (!motionLoaded) {
      throw new Error(
        "leaflet.motion plugin not loaded correctly, please ensure the plugin file is properly included"
      );
    }

    // Wait for map to fully load
    await new Promise((resolve) => {
      if (map._loaded) {
        resolve();
      } else {
        map.on("load", resolve);
        setTimeout(resolve, 2000);
      }
    });

    const geoDataLoaded = await loadGeographicData();
    if (!geoDataLoaded) {
      throw new Error("Geographic data loading failed");
    }

    trajectoryData = await loadTrajectoryData();

    if (trajectoryData && trajectoryData.events.length > 0) {
      const slider = document.getElementById("timeline-slider");
      if (slider) {
        slider.max = trajectoryData.events.length - 1;
        slider.style.transition = `all ${animationConfig.timelineDuration}ms ease`;
      }

      const totalCountEls = document.querySelectorAll(
        "[id^='total-event-count']"
      );
      totalCountEls.forEach((el) => {
        if (el) el.textContent = trajectoryData.events.length;
      });

      updateStatistics();
      showEventAtIndex(0, false);

      setTimeout(() => {
        optimizeMotionPerformance();

        if (motionLoaded) {
          preloadKeyAnimations();
        }

        const performanceMonitor = monitorMotionPerformance();
        window.motionPerformanceMonitor = performanceMonitor;
      }, 1500);
    } else {
      throw new Error("轨迹数据为空");
    }

    bindEvents();
    hideLoading();

    const mapEl = document.getElementById("map");
    if (isMobileDevice()) {
      mapEl.classList.add("panel-visible");
    }

    window.addEventListener("beforeunload", () => {
      forceStopPoetryAnimation();

      cleanupMotionResources();
      if (window.motionObserver) {
        window.motionObserver.disconnect();
      }
      if (window.motionPerformanceMonitor) {
        window.motionPerformanceMonitor.stop();
      }
    });

    console.log("leaflet.motion 插件状态:", motionLoaded ? "已加载" : "未加载");
  } catch (error) {
    console.error("应用初始化失败:", error);

    const loading = document.getElementById("loading");
    if (loading) {
      loading.innerHTML = `
        <div class="error">
          <h3>加载失败</h3>
          <p>应用初始化时出现错误，请刷新页面重试。</p>
          <p>错误信息: ${error.message}</p>
        </div>
      `;
    }
  }
}

// ==================== 启动应用 ====================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}
