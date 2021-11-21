downloader = (function () {
    function loadJSZip() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js';
        document.head.append(script);
    }

    loadJSZip();

    function getImageUrls() {
        console.log('Extracting image urls');
        const imgNodes = $$('.js-posts-container.b-photos.g-negative-sides-gaps .b-photos__item');
        const imgUrls = imgNodes.map(e => {
            const vue = e.__vue__;
            const computed = vue._computedWatchers.media;
            if (computed != undefined) {
                return computed.value[0].full;
            }
            else {
                const parentVnode = vue.$vnode.parent.componentInstance;
                return parentVnode._computedWatchers.media.value[0].full;
            }
        })
        return imgUrls;
    }

    function getVideoUrls() {
        console.log('Extracting video urls');
        const vidNodes = $$('.js-posts-container.b-photos.g-negative-sides-gaps .b-photos__item.m-video-item');
        const vidUrls = vidNodes.map(e => {
            const vue = e.__vue__;
            const computedVideo = vue._computedWatchers.media.value;
            return computedVideo[0].full;
        })
        return vidUrls;
    }

    function getStoryUrls() {
        console.log('Extracting story urls');
        const storyNode = $('.b-story-item.m-gradient-overlay.js-my-stories-element');
        const vue = storyNode.__vue__;
        const stories = vue._computedWatchers.stories.value;
        const urls = stories.map(e => e.media[0].files.source.url);
        return urls;
    }

    async function getData(url) {
        const response = await fetch(url);
        return response.blob();
    }

    function getFileName(url) {
        const parts = url.split('?')[0].split('/');
        return parts[parts.length - 1];
    }

    async function createZip(urls) {
        console.log('Creating zip file');
        const zip = JSZip();
        for (const url of urls) {
            const filename = getFileName(url);
            console.log(`Adding ${filename}`);
            const data = await getData(url);
            zip.file(filename, data);
        }
        return zip.generateAsync({ type: 'blob' });
    }

    function downloadZip(zip, name) {
        console.log('Downloading zip file');
        link = document.createElement('a');
        link.href = window.URL.createObjectURL(zip);
        link.download = `${name}.zip`;
        link.click();
    }

    return {
        downloadImages: function () {
            urls = getImageUrls();
            createZip(urls).then(zip => downloadZip(zip, 'images'));
        },
        downloadVideos: function () {
            urls = getVideoUrls();
            createZip(urls).then(zip => downloadZip(zip, 'videos'));
        },
        downloadStories: function () {
            urls = getStoryUrls();
            createZip(urls).then(zip => downloadZip(zip, 'stories'));
        }
    }
})();
