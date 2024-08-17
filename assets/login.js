const r = new rive.Rive({
    src: `./assets/discord.riv`,
    canvas: document.getElementById('discord'),
    autoplay: true,
    stateMachines: "State Machine 1",
    onLoad: () => {
      r.resizeDrawingSurfaceToCanvas();
    },
});