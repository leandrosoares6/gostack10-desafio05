import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../components/Container';
import {
  Loading,
  Owner,
  DropdownButton,
  DropdownItem,
  IssueList,
  Pagination,
  ButtonPreviousPage,
  ButtonNextPage,
} from './styles';

export default class Repository extends Component {
  // eslint-disable-next-line react/static-property-placement
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  // eslint-disable-next-line react/state-in-constructor
  state = {
    repository: {},
    issues: [],
    stateFilter: ['all', 'open', 'closed'],
    actualState: 'all',
    page: 1,
    loading: true,
  };

  async componentDidMount() {
    const { match } = this.props;
    const { actualState, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: actualState,
          per_page: 5,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  handleSelectChange = async e => {
    await this.setState({ actualState: e.target.value });
    this.componentDidMount();
  };

  async handlePreviousPage() {
    const { page } = this.state;

    await this.setState({
      page: page - 1,
    });

    await this.componentDidMount();
  }

  async handleNextPage() {
    const { page } = this.state;

    await this.setState({
      page: page + 1,
    });

    await this.componentDidMount();
  }

  render() {
    const { repository, issues, stateFilter, page, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <DropdownButton onChange={this.handleSelectChange}>
          {stateFilter.map(state => (
            <DropdownItem key={state} value={state}>
              {state}
            </DropdownItem>
          ))}
        </DropdownButton>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <ButtonPreviousPage
            onClick={() => {
              this.handlePreviousPage();
            }}
            page={page}
          >
            <FaAngleLeft />
          </ButtonPreviousPage>
          <strong>{page}</strong>
          <ButtonNextPage
            onClick={() => {
              this.handleNextPage();
            }}
            page={page}
          >
            <FaAngleRight />
          </ButtonNextPage>
        </Pagination>
      </Container>
    );
  }
}
