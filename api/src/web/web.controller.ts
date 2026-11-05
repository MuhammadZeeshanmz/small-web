import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { WebService } from './web.service';

@Controller()
export class WebController {
  constructor(private readonly web: WebService) {}

  @Get('people')
  people() {
    return this.web.people();
  }

  @Get('sites/:address')
  site(@Param('address') address: string) {
    return this.web.site(address);
  }

  @Get('search')
  search(@Query('q') q = '') {
    return this.web.search(q);
  }

  @Post('sites')
  publish(@Body() body: { address: string; title: string; html: string; author: string }) {
    return this.web.publish(body);
  }

  @Post('visits')
  visit(@Body() body: { person: string; address: string; via: string; status: string }) {
    return this.web.visit(body);
  }

  @Get('people/:name/history')
  history(@Param('name') name: string) {
    return this.web.history(name);
  }
}