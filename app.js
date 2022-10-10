const chartSection = document.querySelector('#chart')
const heatmapSection = document.querySelector('#heatmap')
const toggle = document.querySelector('.toggle')
const bars = document.querySelector('.bars')
const heatmaps = document.querySelector('.heatmaps')


toggle.addEventListener('click', (event) => {
    let target = event.target

    if(target.classList.contains('bars')) {
        console.log('aaa')
        if(chartSection.classList.contains('none')){
            heatmapSection.classList.remove('display-heatmaps')
            heatmapSection.classList.add('none')
            chartSection.classList.remove('none')
            chartSection.classList.add('display-bars')
            bars.style.backgroundColor = '#cecece'
            heatmaps.style.backgroundColor = '#f1f1f1'
        }
    }
    if(target.classList.contains('heatmaps')) {
        console.log('bb')
        if(heatmapSection.classList.contains('none')){
            chartSection.classList.remove('display-bars')
            chartSection.classList.add('none')
            heatmapSection.classList.remove('none')
            heatmapSection.classList.add('display-heatmaps')
            bars.style.backgroundColor = '#f1f1f1'
            heatmaps.style.backgroundColor = '#cecece'
        }

    }
})
