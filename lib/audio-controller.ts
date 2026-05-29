let audio: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let analyser: AnalyserNode | null = null;
let source: MediaElementAudioSourceNode | null = null;

export function getAudioController() {
  if (!audio) {
    audio = new Audio();
    audio.crossOrigin = "anonymous";
  }

  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (!analyser && audioContext) {
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
  }

  if (audio && audioContext && analyser && !source) {
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
  }

  return {
    audio,
    audioContext,
    analyser,
  };
}
