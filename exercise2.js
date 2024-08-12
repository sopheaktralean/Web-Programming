const http = require('http');
const cookie = require('cookie');
const { format, utcToZonedTime } = require('date-fns-tz'); 

// Function to format the date with the specified time zone
function formatDateWithTimeZone(date, timezone) {
    const zonedDate = utcToZonedTime(date, timezone);
    return format(zonedDate, 'EEE MMM dd HH:mm:ss OOOO yyyy', { timeZone: timezone });
}
http.createServer((req, res) => {
    // Debugging: Log the incoming request URL and headers
    console.log(`Request URL: ${req.url}`);
    console.log(`Request Headers: ${JSON.stringify(req.headers)}`);

    // Only increment the visit count for the main page
    if (req.url === '/') {
        // Parse cookies from the request
        const cookies = cookie.parse(req.headers.cookie || '');
        console.log(`Parsed Cookies: ${JSON.stringify(cookies)}`);

        let visitCount = parseInt(cookies.visitCount || '0', 10) + 1;

        console.log(`Visit Count: ${visitCount}`);

        res.setHeader('Set-Cookie', [
            cookie.serialize('visitCount', visitCount.toString(), { httpOnly: true, path: '/' }),
            cookie.serialize('lastVisitDate', new Date().toUTCString(), { httpOnly: true, path: '/' })
        ]);

        const now = new Date();
        const timezone = 'America/New_York';

        if (visitCount === 1) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1 style ="color: darkgreen;">Welcome to my webpage! This is your first time that you are here.</h1>');
        } else {
            const lastVisitDate = cookies.lastVisitDate ? new Date(cookies.lastVisitDate) : now;
            const formattedLastVisit = formatDateWithTimeZone(lastVisitDate, timezone);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<h1 style ="color: darkblue;">Hello, this is the ${visitCount} time(s) that you are visiting my webpage.</h1><p>Last time you visited my webpage on: ${formattedLastVisit}</p>`);
        }
    } else {
        res.writeHead(204);
        res.end();
    }
}).listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
