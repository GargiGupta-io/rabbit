import {
  conferenceDescriptionSignature,
  ConferenceDescriptionText,
  descriptionAddConference,
  generateCustomLocationMeetingMessage,
  generatePhoneMeetingMessage,
  generateZoomMeetingMessage,
  generateZoomPersonalMeetingMessage,
  stripDescriptionConference,
} from '../conference-description'

describe('stripDescriptionConference', () => {
  it('returns the initial input', () => {
    const randomHtml =
      '<pre><code class="language-typescript">stripDescriptionConference</code></pre>'

    expect(stripDescriptionConference(randomHtml)).toBe(randomHtml)

    const paragraph1 =
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>'

    expect(stripDescriptionConference(paragraph1)).toBe(paragraph1)

    const longText =
      '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin ut dolor sit amet ante volutpat mattis non vel nisi. Sed auctor augue ligula, vitae semper arcu dictum sit amet. Ut arcu nulla, efficitur ac lectus ac, condimentum iaculis nunc. Fusce justo sem, vulputate ac turpis at, efficitur tempus turpis. In tincidunt enim vel luctus luctus. Duis vitae porta metus. Curabitur nec tincidunt arcu. Praesent sit amet egestas nunc. Maecenas dui lorem, varius vitae gravida vitae, sollicitudin vel arcu. Maecenas fermentum vitae nibh nec aliquam. Aliquam suscipit elementum orci. In finibus pretium ex eu eleifend. Pellentesque ac malesuada quam, ut pulvinar mauris. Aliquam eget urna a diam ultricies vulputate. Curabitur luctus ullamcorper purus.</p><p>Morbi aliquet magna neque, in condimentum dui consequat in. Pellentesque gravida enim ac sagittis venenatis. Fusce consequat fermentum est eu pulvinar. Suspendisse condimentum finibus euismod. Nulla felis sem, malesuada et nisl sit amet, mollis posuere quam. Morbi pretium luctus nulla nec porta. Integer sodales sit amet mauris eget aliquet. Nunc sit amet feugiat dui. Duis finibus erat nisi, at rhoncus augue faucibus in. Donec consequat, nibh sed sagittis lobortis, justo nunc ultrices libero, at tristique mi nisl eu nisl. Etiam id commodo leo. In sollicitudin nisl eu enim molestie, non tempus ligula condimentum. Nulla sit amet consectetur metus.</p><p>Maecenas tortor purus, vehicula in hendrerit nec, hendrerit auctor tortor. Maecenas varius vel est eget cursus. Integer posuere, orci at elementum dignissim, justo nisl convallis sapien, ut commodo ipsum ante eu felis. Donec non enim non nisi imperdiet posuere. Praesent varius aliquet blandit. Vestibulum lorem sapien, condimentum ut commodo vel, semper vitae erat. Curabitur in augue vitae eros semper dapibus. Quisque faucibus nisi sodales tincidunt tempor. Cras et sodales eros, eget egestas nunc. Donec pretium quam ornare ante rhoncus facilisis. Duis vel ante non nisl fermentum laoreet. Suspendisse iaculis lorem sit amet ipsum aliquet tristique. Cras luctus purus enim, eu congue risus elementum a. Etiam a blandit magna. Suspendisse porta commodo libero, at imperdiet ligula laoreet ac. Mauris suscipit aliquam dolor, a maximus urna vehicula sed.</p><p>Suspendisse vulputate risus sed ultrices bibendum. Mauris viverra iaculis porta. Fusce finibus sed metus ut porttitor. Sed pretium porttitor nisl, non convallis nulla semper sit amet. Fusce porta accumsan tortor ut pellentesque. Sed suscipit ornare enim vitae pharetra. Cras consequat neque quis sagittis interdum. Nulla porta ultricies risus. Duis in libero non enim rhoncus ultrices et blandit nibh. Nunc luctus sem vitae dui porttitor, ac facilisis sapien maximus. Integer non ultrices diam. Nunc nulla ligula, sollicitudin sed enim et, bibendum condimentum mauris. Cras ac neque ut leo scelerisque sagittis. Pellentesque tristique ultrices justo id bibendum. Proin commodo, orci nec interdum aliquet, lorem felis cursus nibh, eu dignissim urna diam a sem. Nullam congue tristique libero, nec placerat purus dictum a.</p><p>Suspendisse laoreet orci ut diam fringilla viverra. Mauris id nisl urna. Sed enim ex, lacinia non pretium a, ultricies eu est. Donec dictum, turpis non molestie tincidunt, ipsum enim maximus risus, non consequat urna nisi at mi. Aenean vel urna orci. Proin hendrerit, turpis vitae consequat lobortis, dui lacus laoreet nisl, id mollis leo massa quis lacus. Nunc est turpis, ultrices a cursus vel, maximus nec massa. Donec non mauris turpis. Morbi arcu nunc, varius vel dignissim a, commodo id diam. Pellentesque non luctus eros. Morbi quis varius est, eget feugiat velit. Sed a pulvinar tellus. Nullam sagittis faucibus ipsum, non fermentum risus. Integer vel dictum nunc, vel sagittis massa. Phasellus et hendrerit ipsum, eu porta tortor.</p>'

    expect(stripDescriptionConference(longText)).toBe(longText)
  })

  it('returns the description without the custom phone', () => {
    const initial = `<p>Some text before adding the conference</p><p>Please use this number for our meeting:</p><p></p><p>+1 123-456-7890</p><p></p><p>-----</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    const expected = `<p>Some text before adding the conference</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    expect(stripDescriptionConference(initial)).toBe(expected)
  })

  it('returns the description without the custom location', () => {
    const initial = `<p>Some text before adding the conference</p><p>Here's the location for our meeting:</p><p></p><p>Somewhere nice</p><p></p><p>-----</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    const expected = `<p>Some text before adding the conference</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    expect(stripDescriptionConference(initial)).toBe(expected)
  })

  it('returns the description without the Zoom info', () => {
    const initial = `<p>Some text before adding the conference</p><p>You have been invited to a scheduled Zoom meeting.</p><p></p><p>Join Zoom Meeting</p><p></p><p><a target="_blank" rel="noopener noreferrer nofollow" href="https://us04web.zoom.us/j/78181992662?pwd=GKzp3wMRqAznQiMzfHtx6TXZkx8LqE.1">https://us04web.zoom.us/j/78181992662?pwd=GKzp3wMRqAznQiMzfHtx6TXZkx8LqE.1</a></p><p></p><p>Meeting ID: 7818 1992 662</p><p></p><p>Password: 8ibYtd</p><p></p><p>-----</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    const expected = `<p>Some text before adding the conference</p><p>Scheduled with <a href="https://www.usemotion.com/referral?ref=calendar" target="_blank">Motion</a></p>`

    expect(stripDescriptionConference(initial)).toBe(expected)
  })

  it('returns the description without the Teams info', () => {
    const initial = `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
<p>With teams and description first before creating</p>
<br>
<font face="Calibri" size="1" color="#404040"><span style="">.........................................................................................................................................</span></font><br>
<font face="Calibri" size="4"><span style="font-size:16pt"><a href="https://join.skype.com/QR5jFa5fDbLC">Join online meeting</a></span></font><br>
<font face="Calibri" size="1" color="#404040"><span style="font-size:8pt">.........................................................................................................................................</span></font><br>
</body>
</html>
`

    const expected = `<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>
<p>With teams and description first before creating</p>
<br>
<font face="Calibri" size="1" color="#404040"><span style=""></span></font><br>
</body>
</html>
`

    expect(stripDescriptionConference(initial)).toBe(expected)
  })
})

describe('conferenceDescription', () => {
  it('generates Zoom meeting message', () => {
    const message = generateZoomMeetingMessage({
      id: 'ABC',
      joinUrl: 'example.com',
      password: 'PASS',
    })

    expect(message).toContain(
      '<a target="_blank" rel="noopener noreferrer nofollow" href="example.com">'
    )
    expect(message).toContain(`<p>${ConferenceDescriptionText.SUFFIX}</p>`)
  })

  it('replaces old message', () => {
    const message = generateZoomMeetingMessage({
      id: 'ABC',
      joinUrl: 'example.com',
      password: 'PASS',
    })
    const cleanedMessage = descriptionAddConference(message, '')

    expect(cleanedMessage).not.toContain(
      '<a target="_blank" rel="noopener noreferrer nofollow" href="example.com">'
    )
    expect(cleanedMessage).toContain(conferenceDescriptionSignature)
  })

  it('generates zoom meeting message', () => {
    const message = generateZoomPersonalMeetingMessage('zoom.link')

    expect(message).toContain('<p>zoom.link</p>')
    expect(message).toContain(`<p>${ConferenceDescriptionText.SUFFIX}</p>`)
  })

  it('generates custom location meeting message', () => {
    const message = generateCustomLocationMeetingMessage('Custom Location')

    expect(message).toContain('<p>Custom Location</p>')
    expect(message).toContain(`<p>${ConferenceDescriptionText.SUFFIX}</p>`)
  })

  it('generates Phone meeting message', () => {
    const message = generatePhoneMeetingMessage('555')

    expect(message).toContain('<p>555</p>')
    expect(message).toContain(`<p>${ConferenceDescriptionText.SUFFIX}</p>`)
  })
})
