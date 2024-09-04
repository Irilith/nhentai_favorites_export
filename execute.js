function getTotalPagesFromHTML(html) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const lastPageLink = doc.querySelector('section.pagination a.last');

	if (lastPageLink) {
		const href = lastPageLink.getAttribute('href');
		const url = new URL(href, document.baseURI);
		const totalPages = parseInt(url.searchParams.get('page'), 10);
		return totalPages;
	}

	return null;
}

async function fetchPageContent(pageNumber) {
	const response = await fetch(`?page=${pageNumber}`);

	if (!response.ok) {
		throw new Error(
			`Error fetching page ${pageNumber}: ${response.statusText}`,
		);
	}

	return response.text();
}

async function fetchAllPages() {
	try {
		const initialResponse = await fetch('?page=1');
		const initialHTML = await initialResponse.text();
		const totalPages = getTotalPagesFromHTML(initialHTML);

		if (totalPages === null) {
			throw new Error('Could not determine total number of pages.');
		}

		const allPageContents = [];

		for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
			console.log(`Fetching page ${pageNumber}...`);
			const pageContent = await fetchPageContent(pageNumber);
			allPageContents.push(pageContent);
		}

		const allPageContentsString = JSON.stringify(allPageContents);
		const blob = new Blob([allPageContentsString], {
			type: 'application/octet-stream',
		});
		const link = document.createElement('a');

		link.href = URL.createObjectURL(blob);
		link.download = 'nhent';
		link.click();

		console.log('Done');
	} catch (error) {
		console.error('Error:', error);
	}
}

fetchAllPages();
