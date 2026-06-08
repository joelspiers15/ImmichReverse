// ==UserScript==
// @name         Immich Backtext viewer
// @namespace    immich-pairing
// @version      0.1
// @match        https://photos.spiers.cc/*
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';

    let lastAssetId = null;

    async function run() {
        // Only run on photo detail pages: any URL that ends with /photos/{uuid}
        const match = location.pathname.match(/\/photos\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\/)?$/);
        if (!match) return;

        const assetId = match[1];
        if (assetId === lastAssetId) return;
        lastAssetId = assetId;

        try {
            await showCounterpart();
        } catch (err) {
            console.error('Immich Backtext viewer error', err);
        }
    }

    // Main
    async function showCounterpart() {
        // get validated UUID from path (match any path that ends with /photos/{uuid})
        const match = location.pathname.match(/\/photos\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(?:\/)?$/);
        if (!match) return;
        const assetId = match[1];

        const asset = await getAsset(assetId);

        const filename = asset.originalFileName;

        console.log('Found filename: ' + filename);

        if (!(filename.endsWith('_a.jpg') || filename.endsWith('_b.jpg'))) {
            return;
        }

        console.log('File eligible for backtext');

        const opFilename = counterpart(filename);
        console.log('Counterpart filename: ' + opFilename);

        const opAsset = await findAssetByFilename(opFilename);
        if (!opAsset) {
            console.log('No counterpart file found with name ' + opFilename);
            return;
        } else {
            console.log('Counterpart file id: ' + JSON.stringify(opAsset));
        }

        renderPanel(opAsset)
    }

    // Text helper
    function counterpart(filename) {
        if (filename.endsWith('_a.jpg')) {
            return filename.replace('_a.jpg', '_b.jpg');
        }

        if (filename.endsWith('_b.jpg')) {
            return filename.replace('_b.jpg', '_a.jpg');
        }

        return null;
    }

    // Search for opFile
    async function findAssetByFilename(filename) {
        const response = await fetch('/api/search/metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                originalFileName: filename,
                size: 10
            })
        });

        if (!response.ok) {
            throw new Error(`Failed searching for ${filename}`);
        }

        const data = await response.json();

        const matches = data.assets?.items?.filter(
            asset => asset.originalFileName === filename
        ) ?? [];

        if (matches.length === 0) {
            return null;
        }

        if (matches.length > 1) {
            throw new Error(
                `Expected exactly 1 match for "${filename}" but found ${matches.length}`
            );
        }

        return matches[0];
    }

    // Do render
    function openImageModal(src) {
        let existing = document.getElementById('backtext-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'backtext-modal';

        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0,0,0,0.9)';
        modal.style.zIndex = '99999';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.cursor = 'zoom-out';

        const img = document.createElement('img');
        img.src = src;
        img.style.maxWidth = '95vw';
        img.style.maxHeight = '95vh';
        img.style.objectFit = 'contain';

        modal.appendChild(img);

        modal.onclick = () => modal.remove();

        document.body.appendChild(modal);
    }

    function renderPanel(asset) {
        let panel = document.getElementById('paired-image-panel');

        const target = document.getElementById('detail-panel')
        ?.querySelector(':scope > section:last-of-type');

        // If the target area isn't present yet (initial page load), wait for it once
        // and then try rendering again. This avoids missing the initial render.
        if (!target) {
            const mo = new MutationObserver((mutations, obs) => {
                const t = document.getElementById('detail-panel')
                    ?.querySelector(':scope > section:last-of-type');
                if (t) {
                    try { obs.disconnect(); } catch (e) {}
                    // small timeout to allow any framework rendering to settle
                    setTimeout(() => renderPanel(asset), 50);
                }
            });

            mo.observe(document.body, { childList: true, subtree: true });
            return;
        }

        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'paired-image-panel';
        }

        const imageUrl = `/api/assets/${asset.id}/thumbnail`;

        const section = document.createElement('section');
        section.className = 'px-4 mt-4';

        // Build DOM safely to avoid injecting filename via innerHTML
        const header = document.createElement('div');
        header.className = 'flex h-10 w-full items-center justify-between text-sm';
        const label = document.createElement('p');
        label.className = 'text-gray-600 dark:text-gray-400 font-normal';
        label.textContent = 'Reverse Side';
        header.appendChild(label);

        const link = document.createElement('a');
        link.href = `/photos/${asset.id}`;
        link.className = 'text-xs text-gray-500 -mt-2 mb-2 block break-all hover:text-primary underline';
        link.title = 'Open reverse side image';
        link.textContent = `${asset.originalFileName} 🡕`;

        section.appendChild(header);
        section.appendChild(link);

        const img = document.createElement('img');
        img.src = imageUrl;
        img.style.width = '100%';
        img.style.cursor = 'zoom-in';
        img.style.borderRadius = '6px';

        img.addEventListener('click', () => {
            openImageModal(`/api/assets/${asset.id}/original`);
        });

        section.appendChild(img);

        panel.innerHTML = '';
        panel.appendChild(section);

        if (!panel.isConnected) {
            target.appendChild(panel);
        }
    }

    // Retrieve image by id
    async function getAsset(assetId) {
        const response = await fetch(`/api/assets/${assetId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch asset ${assetId}`);
        }

        return response.json();
    }

    function hookNavigation() {
        const origPushState = history.pushState;
        const origReplaceState = history.replaceState;

        // debounce to avoid rapid repeated runs
        let triggerTimer = null;
        function trigger() {
            clearTimeout(triggerTimer);
            triggerTimer = setTimeout(() => {
                run().catch(err => console.error('Backtext run error', err));
            }, 120);
        }

        history.pushState = function () {
            origPushState.apply(this, arguments);
            trigger();
        };

        history.replaceState = function () {
            origReplaceState.apply(this, arguments);
            trigger();
        };

        window.addEventListener('popstate', trigger);

        const observer = new MutationObserver(trigger);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // disconnect observer when page unloads
        window.addEventListener('beforeunload', () => {
            try { observer.disconnect(); } catch (e) {}
        });

        // initial run
        run().catch(err => console.error('Backtext initial run error', err));
    }

    hookNavigation();
})();
