/**
 * External dependencies
 */
import { useState } from 'react';
import useSWR from 'swr';
import { useDebounce } from 'use-debounce';
import doFetch from 'isomorphic-fetch';
import { map } from 'lodash';

/**
 * Async/Await fecthing handler.
 *
 * @param args
 */
const fetch = async function( ...args ) {
	const res = await doFetch( ...args );
	return await res.json();
};

/*
 * Constants
 */
const API_HOST    = 'https://public-api.wordpress.com/';
const API_VERSION = 'wp/v2/';

/**
 * Render the given posts list.
 * @param posts
 * @return {*}
 * @constructor
 */
const PostsList = ( { posts } ) => {
	if ( ! posts || ! posts.length ) {
		return <div>No posts</div>;
	}

	const title = posts.length > 1
		? `${ posts.length } posts found.`
		: `${ posts.length } post found.`;

	return (
		<div className="posts-container">
			<style jsx>{`
				.post-container {
					margin: 5px 10px;
					padding: 2px 50px;
				}
			`}</style>
			<hr />
			<h3>{ title }</h3>

			{
				map( posts, ( { guid, title, id, modified } ) => (
					<div key={ id } className="post-container">
						<a
							href={ guid.rendered }
							dangerouslySetInnerHTML={ { __html: title.rendered } }
						/>

						<span className="date"> ( {
							new Date( modified ).toLocaleDateString('en-US' )
						} )</span>
					</div>
					)
				)
			}
			<hr />
		</div>
	)
};

export default () => {
	const [ perPage, setPerPage ] = useState( 5 );
	const [ blogURL, setBlogValue ] = useState( 'retrofoxsimplecustom01.wordpress.com' );
	const [ blogId ] = useDebounce( blogURL, 1000 );

	const { data, error } = useSWR(
		`${API_HOST}${API_VERSION}sites/${blogId}/posts?per_page=${ perPage }`,
		fetch
	);

	return (
		<>
			<h1>Testing SWR hook</h1>

			<input
				type="number"
				value={ perPage }
				onChange={ ( ev ) => setPerPage( ev.target.value ) }
			/>

			<input
				type="text"
				value={ blogURL }
				onChange={ ( ev ) => setBlogValue( ev.target.value ) }
			/>

			<br />

			{
				( data && data.data && data.data.status !== 200 ) && (
					<div className="error">
						{ data.data.status }
					</div>
				)
			}

			<PostsList posts={ data } />

			<style jsx>{`
				font-family: monospace;
				font-size: 14px;

				input[type] {
					width: 400px;
					height: 26px;
					padding: 3px;
				}

				input[type=number] { width: 30px; }

				.error {
					color: red;
					font-weight: bold;
				}
			`}</style>
		</>
	);
};

