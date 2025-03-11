/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const fullProducts = productsFromServer.map(product => {
  const productCopy = { ...product };
  const category = categoriesFromServer.find(
    currCategory => product.categoryId === currCategory.id,
  ); // find by product.categoryId
  const user = usersFromServer.find(
    currUser => category.ownerId === currUser.id,
  ); // find by category.ownerId

  productCopy.category = category;
  productCopy.user = user;

  return productCopy;
});

function getPreparedProducts(
  products,
  { query },
  filterCategories = null,
  filterUsers = null,
  sortField = null,
) {
  let preparedProducts = products;

  if (filterUsers) {
    preparedProducts = preparedProducts.filter(product => {
      return product.user.name === filterUsers;
    });
  }

  if (filterCategories) {
    preparedProducts = preparedProducts.filter(product => {
      return product.category.title === filterCategories;
    });
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    preparedProducts = preparedProducts.filter(product => {
      return product.name.toLowerCase().includes(normalizedQuery);
    });
  }

  if (sortField) {
    preparedProducts = preparedProducts.sort((product1, product2) => {
      switch (sortField) {
        case 'ID':
          return product1.id - product2.id;

        case 'Product':
          return product1.name.localeCompare(product2.name);

        case 'Category':
          return product1.category.title.localeCompare(product2.category.title);

        case 'User':
          return product1.user.name.localeCompare(product2.user.name);

        default:
          return 0;
      }
    });
  }

  return preparedProducts;
}

export const App = () => {
  const [filterUsers, setFilterUsers] = useState(null);
  const [filterCategories, setFilterCategories] = useState(null);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState(null);
  // const [reversed, setReversed] = useState(false);
  const visibleProducts = getPreparedProducts(
    fullProducts,
    { query },
    filterCategories,
    filterUsers,
    sortField,
  );

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                // data-cy="FilterUser"
                className={cn({
                  'is-active': filterUsers === null,
                })}
                href="#/"
                onClick={() => setFilterUsers(null)}
              >
                All
              </a>

              {usersFromServer.map(user => (
                <a
                  key={user.id}
                  data-cy="FilterUser"
                  className={cn({
                    'is-active': filterUsers === user.name,
                  })}
                  href="#/"
                  onClick={() => setFilterUsers(user.name)}
                >
                  {user.name}
                </a>
              ))}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  id="search-query"
                  className="input"
                  placeholder="Search"
                  onChange={event => {
                    setQuery(event.target.value);
                  }}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>

                {query !== '' && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-info': filterCategories === null,
                  'is-outlined': filterCategories !== null,
                })}
                onClick={() => setFilterCategories(null)}
              >
                All
              </a>

              {categoriesFromServer.map(category => (
                <a
                  key={category.id}
                  data-cy="Category"
                  className={cn('button mr-2 my-1', {
                    'is-info': filterCategories === category.title,
                  })}
                  href="#/"
                  onClick={() => setFilterCategories(category.title)}
                >
                  {category.title}
                </a>
              ))}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setFilterCategories(null);
                  setFilterUsers(null);
                  setQuery('');
                  setSortField(null);
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {visibleProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  {['ID', 'Product', 'Category', 'User'].map(field => (
                    <th key={field}>
                      <span className="is-flex is-flex-wrap-nowrap">
                        {field}
                        <a
                          href="#/"
                          onClick={() => {
                            setSortField(field);
                          }}
                        >
                          <span className="icon">
                            <i data-cy="SortIcon" className="fas fa-sort" />
                          </span>
                        </a>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {visibleProducts.map(product => (
                  <tr data-cy="Product" key={product.id}>
                    <td className="has-text-weight-bold" data-cy="ProductId">
                      {product.id}
                    </td>

                    <td data-cy="ProductName">{product.name}</td>
                    <td data-cy="ProductCategory">{`${product.category.icon} - ${product.category.title}`}</td>

                    <td
                      data-cy="ProductUser"
                      className={cn({
                        'has-text-link': product.user.sex === 'm',
                        'has-text-danger': product.user.sex === 'f',
                      })}
                    >
                      {product.user.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
