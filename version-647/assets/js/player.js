(function () {
  function setStatus(player, message) {
    var status = player.querySelector('.js-player-status');
    if (status) {
      status.textContent = message;
    }
  }

  function initializePlayer(player) {
    var video = player.querySelector('.js-player');
    var playButton = player.querySelector('.js-player-play');
    var source = player.getAttribute('data-video-url');
    var initialized = false;
    var hlsInstance = null;

    if (!video || !source) {
      setStatus(player, '播放源暂不可用');
      return;
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus(player, '正在加载播放源...');

      if (window.Hls && window.Hls.isSupported() && source.indexOf('.m3u8') !== -1) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus(player, '播放源已就绪');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus(player, '网络错误，正在重试...');
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus(player, '媒体错误，正在恢复...');
            hlsInstance.recoverMediaError();
          } else {
            setStatus(player, '无法播放当前视频源');
            hlsInstance.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus(player, '播放源已就绪');
      } else {
        video.src = source;
        setStatus(player, '已尝试使用浏览器原生播放器');
      }

      return Promise.resolve();
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            setStatus(player, '请再次点击播放');
          });
        }
      });
    }

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
      setStatus(player, '正在播放');
    });

    video.addEventListener('pause', function () {
      player.classList.remove('is-playing');
      setStatus(player, '已暂停');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      setStatus(player, '播放结束');
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(initializePlayer);
})();
